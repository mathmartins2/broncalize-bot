import { Module } from '@nestjs/common';
import { MusicModule } from './music/music.module';
import { BotModule } from './bot/bot.module';
import { NecordModule } from 'necord';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NecordModule.forRoot({
      token: process.env.DISCORD_BOT_TOKEN,
      intents: [
        'Guilds',
        'GuildMessages',
        'DirectMessages',
        'GuildVoiceStates',
      ],
    }),
    MusicModule,
    BotModule,
  ],
})
export class AppModule {}
