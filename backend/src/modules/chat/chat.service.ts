import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity } from './entity/chat.entity';
import { User } from '../users/entity/user.entity';
import { Provider } from '../providers/entity/provider.entity';
import { CreateMessageDto, GenerateSignedUrlDto, MessageType } from './dto/chat.dto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  private readonly bucketName = 'surtte-chat-files';
  private readonly region = 'us-east-2';
  private readonly cloudFrontUrl = 'https://cdn.surtte.com';
  private readonly s3 = new S3Client({ region: this.region });

  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
  ) {}

  async getUserName(userId: number): Promise<string> {
    const provider = await this.providerRepo.findOne({ where: { id: userId  } });
    if (provider) return provider.nombre_empresa;
  
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) return user.nombre;
  
    return 'Desconocido';
  }
  

  async createMessage(data: CreateMessageDto): Promise<ChatEntity> {
    const newMessage = this.chatRepository.create({
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      messageType: data.messageType,
      fileUrl: data.fileUrl || null,
      isDelivered: false,
      isRead: false,
    });

    return await this.chatRepository.save(newMessage);
  }

  async markMessagesAsDelivered(senderId: number, receiverId: number): Promise<void> {
    await this.chatRepository
      .createQueryBuilder()
      .update(ChatEntity)
      .set({ isDelivered: true })
      .where('senderId = :senderId', { senderId })
      .andWhere('receiverId = :receiverId', { receiverId })
      .andWhere('isDelivered = false')
      .execute();
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    await this.chatRepository
      .createQueryBuilder()
      .update(ChatEntity)
      .set({ isRead: true })
      .where('senderId = :senderId', { senderId })
      .andWhere('receiverId = :receiverId', { receiverId })
      .andWhere('isRead = false')
      .execute();
  }

  async findConversation(userId1: number, userId2: number): Promise<ChatEntity[]> {
    const messages = await this.chatRepository
      .createQueryBuilder('chat')
      .where(
        '(chat.senderId = :userId1 AND chat.receiverId = :userId2) OR (chat.senderId = :userId2 AND chat.receiverId = :userId1)',
        { userId1, userId2 },
      )
      .andWhere('chat.isDeleted = false')
      .orderBy('chat.createdAt', 'ASC')
      .getMany();
  
    if (!messages.length) {
      throw new NotFoundException('No conversation found between these users');
    }
  
    return messages;
  }
  

  async findLastMessage(userId1: number, userId2: number): Promise<ChatEntity | null> {
    const message = await this.chatRepository
      .createQueryBuilder('chat')
      .where(
        '(chat.senderId = :userId1 AND chat.receiverId = :userId2) OR (chat.senderId = :userId2 AND chat.receiverId = :userId1)',
        { userId1, userId2 },
      )
      .andWhere('chat.isDeleted = false')
      .orderBy('chat.createdAt', 'DESC')
      .getOne();
  
    return message || null;
  }
  

  async listConversations(currentUserId: number): Promise<any[]> {
    const allMessages = await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.senderId = :id OR chat.receiverId = :id', { id: currentUserId })
      .andWhere('chat.isDeleted = false')
      .orderBy('chat.createdAt', 'DESC')
      .getMany();
  
    const convoMap = new Map<string, ChatEntity>();
  
    for (const msg of allMessages) {
      const key = [msg.senderId, msg.receiverId].sort((a, b) => a - b).join('-');
      if (!convoMap.has(key)) {
        convoMap.set(key, msg);
      }
    }
  
    const results = [];
  
    for (const [_, lastMessage] of convoMap.entries()) {
      const otherUserId = lastMessage.senderId === currentUserId ? lastMessage.receiverId : lastMessage.senderId;
      const otherUserName = await this.getUserName(otherUserId);
      const unreadCount = await this.countUnreadMessages(currentUserId, otherUserId);
  
      results.push({
        userId: otherUserId,
        otherUserName,
        lastMessage,
        unreadCount
      });
    }
  
    return results;
  }  

  async countUnreadMessages(userId: number, fromUserId: number): Promise<number> {
    const count = await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.senderId = :fromUserId', { fromUserId })
      .andWhere('chat.receiverId = :userId', { userId })
      .andWhere('chat.isRead = false')
      .andWhere('chat.isDeleted = false')
      .getCount();
  
    return count;
  }
  

  async searchMessages(userId: number, keyword: string): Promise<ChatEntity[]> {
    return await this.chatRepository
      .createQueryBuilder('chat')
      .where('(chat.senderId = :userId OR chat.receiverId = :userId)', { userId })
      .andWhere('chat.message ILIKE :keyword', { keyword: `%${keyword}%` })
      .andWhere('chat.isDeleted = false')
      .orderBy('chat.createdAt', 'DESC')
      .getMany();
  }
  

  async generateSignedUrlForMessage(dto: GenerateSignedUrlDto): Promise<{ signedUrl: string; finalUrl: string }> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/mp3', 'application/pdf'];

    if (!allowedMimeTypes.includes(dto.mimeType)) {
      throw new ForbiddenException('Unsupported file type.');
    }

    const extension = dto.filename.split('.').pop();
    const key = `messages/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: dto.mimeType,
      ACL: 'private',
    });

    try {
      const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
      const finalUrl = `${this.cloudFrontUrl}/${key}`;

      return { signedUrl, finalUrl };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate signed URL.');
    }
  }

  async deleteMessage(messageId: string, userId: number): Promise<void> {
    const message = await this.chatRepository.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Mensaje no encontrado.');
    if (message.senderId !== userId) throw new ForbiddenException('No puedes eliminar este mensaje.');
  
    if (message.isDeleted) {
      throw new ForbiddenException('Este mensaje ya fue eliminado.');
    }
  
    message.isDeleted = true;
    await this.chatRepository.save(message);
  
    if (message.fileUrl) {
      const key = message.fileUrl.split('https://cdn.surtte.com/')[1];
  
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
  
      try {
        await this.s3.send(command);
      } catch (error) {
        console.error('Error deleting file from S3:', error);
      }
    }
  }
  
}
