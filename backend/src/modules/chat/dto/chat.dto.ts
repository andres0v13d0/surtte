import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  AUDIO = 'AUDIO',
}

export class CreateMessageDto {
  @IsNumber()
  senderId: number;

  @IsNumber()
  receiverId: number;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(MessageType)
  messageType: MessageType;

  @IsString()
  @IsOptional()
  fileUrl?: string;
}

export class MessageResponseDto {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: MessageType;
  fileUrl?: string;
  isDelivered: boolean;
  isRead: boolean;
  isDeleted: boolean; 
  createdAt: Date;
  updatedAt: Date;
}

export class GenerateSignedUrlDto {
  @IsString()
  filename: string;

  @IsString()
  mimeType: string;
}
