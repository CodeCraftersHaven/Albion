import { Cooldowns } from '#adapters';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';

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
      }, 180000); // 3 minutes
    });
    this.login();
  }

  private async updateStatus() {
    try {
      let uniqueMembers = new Set();
      let count = 0;
      for (const guild of this.guilds.cache.values()) {
        count++;
        const members = await guild.members.fetch();
        members.forEach((member) => {
          if (!member.user.bot && !uniqueMembers.has(member.user.id)) {
            uniqueMembers.add(member.user.id);
          }
        });
      }

      const numberOfDescendants = uniqueMembers.size;
      let acts = [
        { 
          name: `over ${numberOfDescendants} Descendants`, 
          type: ActivityType.Watching 
        }, 
        { 
          name: `over ${count} servers`, 
          type: ActivityType.Watching 
        }
      ];
      
      const currentAct = acts.shift();
      this.user?.setPresence({
        activities: [
          {
            name: currentAct!.name.toString(),
            type: currentAct!.type
          }
        ], 
        status: 'online'
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }
}
