import { Controller, Get, Param } from '@nestjs/common';
import GameProvider from '../game/game.provider';

@Controller('game')
export class GameController {
	constructor(private games: GameProvider) {}

	@Get()
	findAll(): string {
		return 'This action returns all games';
	}

	@Get(':name')
	createGame(@Param('name') name: string): any {
		const game = this.games.create(name);
		return {
			name,
			secret: game.secret,
		};
	}
}
