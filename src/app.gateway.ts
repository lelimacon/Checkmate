import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

class User {
  public id: string;
  public name: string;
}

class Move {
  public playerId: string;
  public code: string;
}

class Chat {
  public playerId: string;
  public message: string;
}

class GameFacade {
  private whitePlayer: User;
  private blackPlayer: User;
  private turn: number = 1;
  private moves: string[] = [];

  private server: Server;

  constructor(server: Server, whitePlayer: User, blackPlayer: User) {
    this.server = server;
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;
  }

  public move(player: User, code: string): boolean {
    if (player.id != this.whitePlayer.id || player.id != this.blackPlayer.id) {
      this.server.emit('message', { message: "External user tried to move" });
      return false;
    }
    this.moves.push(code);
    this.turn += 1;
    this.server.emit('move', { playerId: player.id, code: code });
    return true;
  }
}

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');
  private connectedUsers: User[] = [];
  private game: GameFacade;

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);

    this.connectedUsers.push({ id: client.id, name: client.id });

    // Start game.
    if (this.connectedUsers.length == 2) {
      this.game = new GameFacade(this.server, this.connectedUsers[0], this.connectedUsers[1]);
      this.server.emit('message', { message: "2 players found, game started" });
    }
  }

  @SubscribeMessage('move')
  handleMove(client: Socket, code: string): boolean {
    const player = this.connectedUsers.find(p => p.id == client.id);

    // Check if game started.
    if (this.game == undefined) {
      this.server.emit('message', { message: "Game has not yet started" });
      return false;
    }

    // Register the move.
    return this.game.move(player, code);
  }

  @SubscribeMessage('chat')
  handleChat(client: Socket, message: string): void {
    const player = this.connectedUsers.find(p => p.id == client.id);
    this.server.emit('chat', { playerId: player.id, message: message });
  }
}
