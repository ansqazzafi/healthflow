import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatbotService } from './chatbot.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatbotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatbotService: ChatbotService) {}

  // Handle new client connection
  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Handle client disconnection
  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Listen for 'startChat' message and send 5 random questions to the client
  @SubscribeMessage('startChat')
  async handleStartChat(client: Socket): Promise<WsResponse<any>> {
    // Get 5 random questions from the chatbot service
    const questions = this.chatbotService.getRandomQuestions(5);
    // Send the random questions to the client
    return { event: 'newQuestions', data: questions };
  }

  // Listen for 'selectQuestion' message and send the corresponding answer
  @SubscribeMessage('selectQuestion')
  async handleSelectQuestion(
    client: Socket,
    @MessageBody() data: { question: string }
  ): Promise<WsResponse<any>> {
    // Get the answer for the selected question
    const answer = this.chatbotService.getAnswerByQuestion(data.question);
    // Send the answer back to the client
    return { event: 'answer', data: answer };
  }
}
