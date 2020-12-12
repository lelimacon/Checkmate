import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import GameFacade from './game.provider';

@Module({
	controllers: [GameController],
	providers: [GameFacade],
	exports: [GameFacade],
})
export class GameModule {}
