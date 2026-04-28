import { Module } from '@nestjs/common';
import { MessagesModule } from './messages/messages.module';
import { PrismaService } from './prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [MessagesModule],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}