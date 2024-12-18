// chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatbotGateway } from './chatbot.gateway';
import { ChatbotService } from './chatbot.service';
@Module({
  imports: [
  ],
  providers: [ChatbotGateway, ChatbotService], // Register the service and gateway here
  exports:[ChatbotService]
})
export class ChatbotModule {}
