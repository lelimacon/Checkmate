import { Server } from 'socket.io';
import { IUser as User } from '../common/interfaces/user.interface';

// interface Move {
//   playerId: string;
//   code: string;
// }

// interface Chat {
//   playerId: string;
//   message: string;
// }

export default class GameFacade {
	private turn: number = 1;
	private moves: string[] = [];

	constructor(private server: Server, private readonly whitePlayer: User, private readonly blackPlayer: User) {}

	public move(player: User, code: string): boolean {
		// wtf is this ?? player.id cannot have the same id than

		// if (player.id != this.whitePlayer.id || player.id != this.blackPlayer.id) {
		// 	this.server.emit('message', { message: 'External user tried to move' });
		// 	return false;
		// }
		this.moves.push(code);
		this.turn += 1;
		this.server.emit('move', { playerId: player.id, code });
		return true;
	}
}
