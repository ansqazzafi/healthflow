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
import { UseGuards } from '@nestjs/common';
import { VerifyAdminGuard } from 'guards/verify-admin.guard';
import { UserService } from '../user/user.service';
import cookie from 'cookie'
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatbotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService

  ) { }

  async handleConnection(socket: Socket) {
    const cookies = socket.handshake.headers.cookie;
    console.log(cookies, "Cookies")

    if (cookies) {
      // Parse the cookies to extract the access token
      const parsedCookies = cookie.parse(cookies); // Use cookie.parse() to parse the cookies
      const accessToken = parsedCookies['access_token']; // Adjust the cookie name if needed

      if (!accessToken) {
        socket.emit('error', 'Authentication access token not found');
        socket.disconnect();
        return;
      }

      try {
        // Verify the access token
        const decodedToken = await this.jwtService.verifyAsync(accessToken, {
          secret: process.env.ACCESS_KEY, // Ensure the correct secret key is used here
        });

        // Attach the user data directly from the decoded token (no need to query the DB)
        socket.data.user = decodedToken; // Assuming the user data (userId, username, etc.) is in the token
        console.log('User authenticated:', socket.data.user);
      } catch (error) {
        socket.emit('error', 'Invalid or expired access token');
        socket.disconnect();
      }
    } else {
      socket.emit('error', 'No cookies found in handshake');
      socket.disconnect();
    }
  }



  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }


  @SubscribeMessage('startChat')
  async handleStartChat(client: Socket): Promise<WsResponse<any>> {

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

