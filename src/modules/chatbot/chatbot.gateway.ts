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
import { JwtService } from '@nestjs/jwt';
import { CustomError } from 'utility/custom-error';
@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class ChatbotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly jwtService: JwtService,
  ) { }
  async handleConnection(socket: Socket) {
    console.log("Connected");
    const token = socket.handshake.auth.token;
    console.log(token, "Token")
    if (!token) {
      throw new CustomError('Authorization token is required');
    }
    try {
      const decodedToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_KEY,
      });
      console.log("decodedToken", decodedToken)
      socket.data.user = decodedToken;
      socket.data.isAuthenticated = true;
      
      socket.emit('userAuthenticated', { name: decodedToken.credentials.name });
      console.log(`User ${decodedToken.credentials.name} authenticated successfully`);
    } catch (error) {
      throw new CustomError('Invalid or expired token', 401);
    }

  }


  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }



  @SubscribeMessage('startChat')
  async handleStartChat(client: Socket): Promise<WsResponse<any>> {
    console.log("called");
    const questions = this.chatbotService.getRandomQuestions(5);
    return { event: 'newQuestions', data: questions };
  }


  @SubscribeMessage('selectQuestion')
  async handleSelectQuestion(
    client: Socket,
    @MessageBody() data: { question: string }
  ): Promise<WsResponse<any>> {
    const answer = this.chatbotService.getAnswerByQuestion(data.question);
    return { event: 'answer', data: answer };
  }
}

