import Game, { GameState } from './models/game';

// interface Move {
//   playerId: string;
//   code: string;
// }

// interface Chat {
//   playerId: string;
//   message: string;
// }

export default class GameProvider {
	private games: Map<string, Game> = new Map<string, Game>();

	public get(gameId: string): Game {
		return this.games.get(gameId.toString());
	}

	public create(gameId: string): Game {
		const game: Game = {
			turn: 1,
			moves: [],
			state: GameState.Initializing,
			secret: "alibaba",
		};
		this.games.set(gameId, game);
		return game;
	}

	public update(gameId: string, game: Game): void {
		this.games.set(gameId, game);
	}
}
