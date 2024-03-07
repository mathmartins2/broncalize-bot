import { StringOption } from 'necord';

export class MusicDto {
  @StringOption({
    name: 'music',
    description: 'The music to play in the voice channel',
    required: true,
  })
  music: string;
}
