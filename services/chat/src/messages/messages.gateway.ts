import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
// import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number; otherUserId: number },
  ) {
    const roomName = this.getRoomName(data.userId, data.otherUserId);
    client.join(roomName);
    console.log(`Client ${client.id} joined room ${roomName}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: number; receiverId: number; content: string },
  ) {
    const message = await this.messagesService.createMessage(
      data.senderId,
      data.receiverId,
      data.content,
    );

    const roomName = this.getRoomName(data.senderId, data.receiverId);
    this.server.to(roomName).emit('newMessage', message);

    return message;
  }

  private getRoomName(userId1: number, userId2: number): string {
    const sorted = [userId1, userId2].sort((a, b) => a - b);
    return `room_${sorted[0]}_${sorted[1]}`;
  }
}