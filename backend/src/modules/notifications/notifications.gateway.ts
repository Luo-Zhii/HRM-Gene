import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Map user ID to multiple socket IDs
  private userSockets: Map<number, Set<string>> = new Map();

  constructor(private jwtService: JwtService) {}

  private extractTokenFromCookie(cookieHeader?: string): string | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(/access_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1] ||
        this.extractTokenFromCookie(client.handshake.headers?.cookie);
      if (!token) {
        client.disconnect();
        return;
      }
      
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'secretKey' });
      const userId = payload.sub || payload.id; 
      
      if (userId) {
        const sockets = this.userSockets.get(userId) || new Set();
        sockets.add(client.id);
        this.userSockets.set(userId, sockets);
        client.data.userId = userId;
      } else {
        client.disconnect();
      }
    } catch (error) {
       console.log("WebSocket connection err:", error);
       client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
  }

  sendNotificationToUser(userId: number, notification: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.size > 0) {
      sockets.forEach(socketId => {
        this.server.to(socketId).emit('newNotification', notification);
      });
    }
  }
}
