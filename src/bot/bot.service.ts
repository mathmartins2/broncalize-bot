import { Injectable, Logger } from '@nestjs/common';
import { Once, On, Context, ContextOf } from 'necord';
import { MusicService } from 'src/music/music.service';

@Injectable()
export class BotService {
  private readonly logger = new Logger(MusicService.name);

  @Once('ready')
  onReady() {
    this.logger.log('Bot is ready');
  }

  @On('warn')
  onWarn(@Context() [message]: ContextOf<'warn'>) {
    this.logger.warn(message);
  }

  @On('error')
  onError(@Context() [message]: ContextOf<'error'>) {
    this.logger.error(message);
  }
}
