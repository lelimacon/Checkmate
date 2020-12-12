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
import { IUser } from '../common/interfaces/user.interface';
import GameFacade from '../game/game.provider';

@WebSocketGateway(8000)
export default class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private game: GameFacade) {}

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('EventsGateway');
	private connectedUsers: IUser[] = [];
	// private game: GameFacade;

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
		if (this.connectedUsers.length === 2) {
			this.game = new GameFacade(this.server, this.connectedUsers[0], this.connectedUsers[1]);
			this.server.emit('message', { message: '2 players found, game started' });
		}
	}

	@SubscribeMessage('move')
	handleMove(client: Socket, code: string): boolean {
		const player = this.connectedUsers.find(p => p.id === client.id);

		// Check if game started.
		if (this.game === undefined) {
			this.server.emit('message', { message: 'Game has not yet started' });
			return false;
		}

		// Register the move.
		return this.game.move(player, code);
	}

	@SubscribeMessage('chat')
	handleChat(client: Socket, message: string): void {
		const player = this.connectedUsers.find(p => p.id === client.id);
		this.server.emit('chat', { playerId: player.id, message });
	}
}
