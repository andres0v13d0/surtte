import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { RedisService } from '../redis/redis.service';
import { NotificationService } from '../notification/notification.service';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './dto/chat.dto';
import { Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
    private readonly notificationService: NotificationService,
    private readonly userService: UsersService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.query.token as string;
  
      if (!token) {
        this.logger.warn(`Conexión rechazada: No token proporcionado`);
        socket.disconnect();
        return;
      }
  
      const decodedToken = await admin.auth().verifyIdToken(token);
      const firebaseUid = decodedToken.uid;
  
      if (!firebaseUid) {
        this.logger.warn(`Conexión rechazada: Token inválido`);
        socket.disconnect();
        return;
      }
  
      const user = await this.userService.getUserByFirebaseUid(firebaseUid);
  
      if (!user) {
        this.logger.warn(`Conexión rechazada: Usuario no encontrado en la base de datos`);
        socket.disconnect();
        return;
      }
  
      const client = this.redisService.getRawClient();
      await client.sadd(`user:${user.id}:sockets`, socket.id);
      await client.set(`user:${user.id}:online`, 'true', 'EX', 3600);
  
      socket.data.userId = user.id; 
  
      this.logger.log(`🟢 Usuario conectado: ${user.id} (${firebaseUid}) con socket ${socket.id}`);
    } catch (error) {
      this.logger.error(`Error en conexión WebSocket: ${error.message}`, error.stack);
      socket.disconnect();
    }
  }
  

  async handleDisconnect(socket: Socket) {
    try {
      const userId = socket.data?.userId;

      if (!userId) {
        return;
      }

      const client = this.redisService.getRawClient();
      await client.srem(`user:${userId}:sockets`, socket.id);

      const remainingSockets = await client.scard(`user:${userId}:sockets`);
      if (remainingSockets === 0) {
        await client.set(`user:${userId}:online`, 'false');
      }

      this.logger.log(`🔴 Usuario desconectado: ${userId} con socket ${socket.id}`);
    } catch (error) {
      this.logger.error(`Error en desconexión WebSocket: ${error.message}`);
    }
  }

  @SubscribeMessage('sendMessage')
async handleMessage(
  @MessageBody() payload: CreateMessageDto,
  @ConnectedSocket() client: Socket,
) {
  try {
    const { senderId, receiverId } = payload;

   

    const newMessage = await this.chatService.createMessage({
      ...payload,
      receiverId: receiverId,
    });

    const redis = this.redisService.getRawClient();
    const isReceiverOnline = await redis.get(`user:${receiverId}:online`);

    if (isReceiverOnline === 'true') {
      const socketIds = await redis.smembers(`user:${receiverId}:sockets`);

      if (socketIds.length > 0) {
        socketIds.forEach(socketId => {
          this.server.to(socketId).emit('receiveMessage', newMessage);
        });
        await this.chatService.markMessagesAsDelivered(senderId, receiverId);
      }
    } else {
      await this.notificationService.sendNotification({
        userId: receiverId,
        title: 'Nuevo mensaje',
        body: payload.message.length > 50 ? `${payload.message.substring(0, 50)}...` : payload.message,
      });

      this.logger.log(`📨 Notificación enviada a ${receiverId} (${receiverId}) por estar offline.`);
    }
  } catch (error) {
    this.logger.error(`Error enviando mensaje: ${error.message}`, error.stack);
  }
}

}
