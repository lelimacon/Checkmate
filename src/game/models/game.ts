import { IUser as User } from '../../common/interfaces/user.interface';

export enum GameState {
	Initializing,
	Ongoing,
	Checkmate,
	Pat,
	Surrender
}

export default interface Game {
	turn: number;
	moves: string[];
	state: GameState;
	whitePlayer?: User;
	blackPlayer?: User;
	secret: string;
}
