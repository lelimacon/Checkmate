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
import GameProvider from '../game/game.provider';
import Game, { GameState } from '../game/models/game';

@WebSocketGateway(8000)
export default class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private games: GameProvider) {}

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('EventsGateway');
	private connectedUsers: IUser[] = [];

	afterInit(server: Server) {
		server = server;
		this.logger.log('Init');
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		args = args;
		this.logger.log(`Client connected: ${client.id}`);

		const player: IUser = { id: client.id, name: client.id };
		this.connectedUsers.push(player);

		// Update game.
		const gameId = "[ROOM]";
		const game: Game = this.games.get(gameId);

		// Check if game started.
		if (game === undefined) {
			this.server.emit('message', { message: 'Game has not yet started' });
			return;
		}

		if (game.whitePlayer === undefined)
			game.whitePlayer = player;
		else if (game.whitePlayer === undefined) {
			game.blackPlayer = player;
			game.state = GameState.Ongoing;
			this.server.emit('message', { message: '2 players found, game started' });
		}

		this.games.update(gameId, game);
	}

	@SubscribeMessage('move')
	handleMove(client: Socket, code: string): boolean {
		// Retrieve player and game.
		const player = this.connectedUsers.find(p => p.id === client.id);
		const gameId = "[ROOM]";
		const game = this.games.get(gameId);

		// Check if game started.
		if (game === undefined) {
			this.server.emit('message', { message: 'Game has not yet started' });
			return false;
		}

		// Check players.
		if (player.id != game.whitePlayer.id && player.id != game.blackPlayer.id) {
			this.server.emit('message', { message: 'External user tried to move' });
			return false;
		}

		// Register the move.
		game.moves.push(code);
		game.turn += 1;
		this.games.update(gameId, game);
		this.server.emit('move', { playerId: player.id, code });
		return true;
	}

	@SubscribeMessage('message')
	handleChat(client: Socket, message: string): void {
		const player = this.connectedUsers.find(p => p.id === client.id);
		this.server.emit('message', { playerId: player.id, message });
	}
}
