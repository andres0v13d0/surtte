import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { MessageType } from '../dto/chat.dto';

@Entity('chat_messages')
@Index(['senderId', 'receiverId']) 
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  @Index() 
  senderId: number;

  @Column('int')
  @Index() 
  receiverId: number;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Column({ type: 'text', nullable: true })
  fileUrl?: string;

  @Column({ default: false })
  isDelivered: boolean;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isDeleted: boolean; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
