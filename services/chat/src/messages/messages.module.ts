import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { PrismaService } from '../prisma.service';
import { JwtStrategy } from '../jwt.strategy';

@Module({
  imports: [PassportModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway, PrismaService, JwtStrategy],
})
export class MessagesModule {}
