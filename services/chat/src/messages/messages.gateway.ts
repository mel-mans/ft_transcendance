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

  /** Let a user join their personal room so they receive notifications for ANY conversation */
  @SubscribeMessage('joinUser')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number },
  ) {
    const userRoom = `user_${data.userId}`;
    client.join(userRoom);
    console.log(`Client ${client.id} joined personal room ${userRoom}`);
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

    this.emitNewMessage(data.senderId, data.receiverId, message);

    return message;
  }

  /** Emit a newMessage event to the conversation room AND both users' personal rooms */
  emitNewMessage(senderId: number, receiverId: number, message: any) {
    const roomName = this.getRoomName(senderId, receiverId);
    this.server.to(roomName).emit('newMessage', message);
    // Also emit to each user's personal room so inbox badges update in real time
    this.server.to(`user_${senderId}`).emit('newMessage', message);
    this.server.to(`user_${receiverId}`).emit('newMessage', message);
  }

  private getRoomName(userId1: number, userId2: number): string {
    const sorted = [userId1, userId2].sort((a, b) => a - b);
    return `room_${sorted[0]}_${sorted[1]}`;
  }
}