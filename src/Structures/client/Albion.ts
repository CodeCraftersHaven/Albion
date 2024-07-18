import { Cooldowns } from '#adapters';
import { ActivityType, Client, GatewayIntentBits, Partials } from 'discord.js';

export class Albion extends Client {
  constructor(private cooldowns: Cooldowns) {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences],
      allowedMentions: {
        repliedUser: false
      },
      shards: 'auto'
    });
    this.on('ready', async () => {
      await this.updateStatus();
      setInterval(async () => {
        await this.updateStatus();
      }, 5 * 60 * 1000);
    });
    this.login();
  }

  private async updateStatus() {
    try {
      let uniqueMembers = new Set();

      for (const guild of this.guilds.cache.values()) {
        const members = await guild.members.fetch();
        members.forEach((member) => {
          if (!member.user.bot && !uniqueMembers.has(member.user.id)) {
            uniqueMembers.add(member.user.id);
          }
        });
      }

      const numberOfDescendants = uniqueMembers.size;
      this.user?.setPresence({
        activities: [{ name: `over ${numberOfDescendants} Descendants`, type: ActivityType.Watching }]
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }
}
