import { Injectable, Logger } from '@nestjs/common';
import { getLyrics } from 'genius-lyrics-api';
import * as ytdl from 'ytdl-core';
import { Context, Options, SlashCommand, SlashCommandContext } from 'necord';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  AudioPlayer,
} from '@discordjs/voice';
import { MusicDto } from './dto/music.dto';
import { ChatInputCommandInteraction, CacheType } from 'discord.js';

@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name);

  @SlashCommand({
    name: 'music',
    description: 'Play music in a voice channel',
  })
  async onMessage(
    @Context() [interaction]: SlashCommandContext,
    @Options() { music }: MusicDto,
  ) {
    this.logger.log(`Message received: ${music}`);
    if (!music) return;
    await interaction.deferReply({ ephemeral: true });
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const connection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const musicInfo = await ytdl.getInfo(music);
    const stream = ytdl(music, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });
    const resource = createAudioResource(stream);

    player.play(resource);
    connection.subscribe(player);
    await interaction.editReply({
      content: `Playing music ${musicInfo.videoDetails.title}!`,
    });

    const lyrics = await this.getLyrics(musicInfo);
    await this.sendLyrics(lyrics, interaction);
    this.streamFollow(player);
  }

  private async sendLyrics(
    lyrics: string,
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    if (lyrics && lyrics.length > 2000) {
      let times = 0;
      const chunkSize = 2000;
      for (let i = 0; i < lyrics.length; i += chunkSize) {
        times += 1;
        if (times > 3)
          return await interaction.followUp({ content: 'Lyrics too long' });
        const chunk = lyrics.substring(i, i + chunkSize);
        await interaction.followUp({ content: chunk });
      }
      return;
    }

    await interaction.followUp({ content: lyrics });
  }

  private async getLyrics(musicInfo: ytdl.videoInfo) {
    const lyrics = await getLyrics({
      apiKey: process.env.GENIUS_API_KEY,
      title: this.extractSongName(musicInfo.videoDetails.title),
      artist: this.extractArtistName(musicInfo.videoDetails.title),
      optimizeQuery: true,
    });
    return lyrics;
  }

  private extractArtistName(title: string) {
    return title.split(' - ')[0];
  }

  private extractSongName(title: string) {
    const parts = title.split(' - ');
    if (parts.length < 1) return title;
    let songName = parts[1];

    songName = songName?.replace(/\s*\(.*?\)\s*/g, '').trim();
    songName = songName?.replace(/\s*\[.*?\]\s*/g, '').trim();

    return songName;
  }

  private streamFollow(player: AudioPlayer) {
    player.on('error', (error) => {
      this.logger.error(`Erro no player: ${error.message}`);
    });

    player.on(AudioPlayerStatus.Playing, () => {
      this.logger.log('O áudio está sendo reproduzido!');
    });
  }
}
