import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { RedisService } from '../redis/redis.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CreateMessageDto, GenerateSignedUrlDto } from './dto/chat.dto';
import { Request } from 'express';

@Controller('chat')
@UseGuards(FirebaseAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
  ) {}

  @Get('is-online/:userId')
  async isUserOnline(@Param('userId') userId: number): Promise<boolean> {
    const client = this.redisService.getRawClient();
    const isOnline = await client.get(`user:${userId}:online`);
    return isOnline === 'true';
  }


  @Get('history/:userId')
  async getConversation(@Param('userId') userId: number, @Req() req: Request) {
    const currentUser = req['userDB'];
    return await this.chatService.findConversation(currentUser.id, userId);
  }

  @Get('last-message/:userId')
  async getLastMessage(@Param('userId') userId: number, @Req() req: Request) {
    const currentUser = req['userDB'];
    return await this.chatService.findLastMessage(currentUser.id, userId);
  }

  @Post('message')
  async createMessage(@Body() dto: CreateMessageDto) {
    return await this.chatService.createMessage(dto);
  }

  @Post('upload')
  async generateSignedUrl(@Body() dto: GenerateSignedUrlDto) {
    return await this.chatService.generateSignedUrlForMessage(dto);
  }

  @Delete('message/:messageId')
  async deleteMessage(@Param('messageId') messageId: string, @Req() req: Request) {
    const currentUser = req['userDB'];
    return await this.chatService.deleteMessage(messageId, currentUser.id);
  }

  @Get('conversations')
  async listConversations(@Req() req: Request) {
    const currentUser = req['userDB'];
    return await this.chatService.listConversations(currentUser.id);
  }

  @Get('unread-count/:fromUserId')
  async countUnreadMessages(@Param('fromUserId') fromUserId: number, @Req() req: Request) {
    const currentUser = req['userDB'];
    return await this.chatService.countUnreadMessages(currentUser.id, fromUserId);
  }

  @Get('search')
  async searchMessages(@Query('keyword') keyword: string, @Req() req: Request) {
    const currentUser = req['userDB'];
    return await this.chatService.searchMessages(currentUser.id, keyword);
  }
}
