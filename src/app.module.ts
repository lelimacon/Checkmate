import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { GameModule } from './game/game.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), EventsModule, GameModule],
})
export class AppModule {}
