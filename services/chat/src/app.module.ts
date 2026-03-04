import { Module } from '@nestjs/common';
import { MessagesModule } from './messages/messages.module';
import { PrismaService } from './prisma.service';
import { AppController } from './app.controller';

@Module({
  imports: [MessagesModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}