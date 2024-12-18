// chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatbotGateway } from './chatbot.gateway';
import { ChatbotService } from './chatbot.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
@Module({
  imports: [
    UserModule

  ],
  providers: [ChatbotGateway, ChatbotService, JwtService], // Register the service and gateway here
  exports:[ChatbotService]
})
export class ChatbotModule {}
