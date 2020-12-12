import { Controller, Get } from '@nestjs/common';

@Controller('game')
export class GameController {
	@Get()
	findAll(): string {
		return 'This action returns all games';
	}

	// @Get()
	// createGame(): any {}
}
