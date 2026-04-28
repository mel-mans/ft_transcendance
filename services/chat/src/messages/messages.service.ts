import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getMessages(userId: number, otherUserId: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createMessage(senderId: number, receiverId: number, content: string) {
    return this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });
  }

  async getInbox(userId: number) {
    const rows = await this.prisma.message.findMany({
      where: {
        receiverId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      take: 200,
    });

    const bySender = new Map<
      number,
      {
        senderId: number;
        senderName: string;
        senderAvatar: string;
        lastMessage: string;
        lastMessageAt: Date;
        unreadCount: number;
      }
    >();

    for (const message of rows) {
      const key = message.senderId;
      const senderName = message.sender?.name || message.sender?.username || `User ${message.senderId}`;
      const senderAvatar = message.sender?.avatar || 'default-avatar.png';

      if (!bySender.has(key)) {
        bySender.set(key, {
          senderId: message.senderId,
          senderName,
          senderAvatar,
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          unreadCount: message.isRead ? 0 : 1,
        });
      } else {
        const current = bySender.get(key)!;
        if (!message.isRead) {
          current.unreadCount += 1;
        }
      }
    }

    return Array.from(bySender.values()).sort(
      (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime(),
    );
  }

  async markThreadAsRead(userId: number, senderId: number) {
    const result = await this.prisma.message.updateMany({
      where: {
        receiverId: userId,
        senderId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      updated: result.count,
    };
  }
}
