import { Cooldowns } from '#adapters';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';

export class Albion extends Client {
  constructor(private cooldowns: Cooldowns) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages
      ],
      allowedMentions: {
        repliedUser: false
      },
      shards: 'auto'
    });
    this.on('ready', () => this.updateStatus());
    this.login();
  }

  private updateStatus() {
    try {
      const guilds = this.guilds.cache.size;
      this.user?.setPresence({
        activities: [
          {
            name: 'Guide',
            type: ActivityType.Custom,
            state: `Guiding Descendants in ${guilds} server${guilds === 1 ? '' : 's'}`
          }
        ],
        status: 'online'
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }
}
