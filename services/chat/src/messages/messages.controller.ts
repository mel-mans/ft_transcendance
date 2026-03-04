import { Controller, Get, Post, Param, Body, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/chat/messages')
@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get(':userId')
  async getMessages(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
    const myId = req.user.id;
    return this.messagesService.getMessages(myId, userId);
  }

  @Post(':userId')
  async createMessage(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('content') content: string,
    @Request() req,
  ) {
    const myId = req.user.id;
    return this.messagesService.createMessage(myId, userId, content);
  }
}