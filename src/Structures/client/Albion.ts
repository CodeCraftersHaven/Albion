import { Cooldowns } from '#adapters';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';

export class Albion extends Client {
  private actsIndex = 0;
  private acts: Array<{ name: string; type: ActivityType; state?: string }> = [];

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
    this.on('ready', async () => {
      await this.updateCounts();
      await this.updateStatus();

      setInterval(async () => {
        await this.updateCounts();
      }, Math.floor(Math.random() * (5 - 3 + 1) + 3) * 60 * 1000);

      setInterval(async () => {
        await this.updateStatus();
      }, 15 * 60 * 1000);
    });
    this.login();
  }

  private async updateCounts() {
    try {
      const uniqueMembers = new Set<string>();
      const descendants = new Set<string>();
      let serverCount = 0;

      for (const guild of this.guilds.cache.values()) {
        serverCount++;
        const members = await guild.members.fetch();
        members.forEach(member => {
          if (!member.user.bot) {
            uniqueMembers.add(member.id);
            if (member.presence?.activities?.some(activity => activity.name === 'The First Descendant')) {
              descendants.add(member.id);
            }
          }
        });
      }

      this.acts = [
        {
          name: 'Guide',
          type: ActivityType.Custom,
          state: `Guiding ${descendants.size} Descendant${descendants.size !== 1 ? 's' : ''}`
        },
        {
          name: `over ${uniqueMembers.size} user${uniqueMembers.size !== 1 ? 's' : ''}`,
          type: ActivityType.Watching
        },
        {
          name: `over ${serverCount} server${serverCount !== 1 ? 's' : ''}`,
          type: ActivityType.Watching
        }
      ];
    } catch (error) {
      console.error('Failed to update counts:', error);
    }
  }
  private async updateStatus() {
    try {
      if (this.acts.length === 0) {
        await this.updateCounts();
      }

      const currentAct = this.acts[this.actsIndex];
      this.actsIndex = (this.actsIndex + 1) % this.acts.length;

      this.user?.setPresence({
        activities: [
          {
            name: currentAct.name,
            type: currentAct.type,
            state: currentAct.state ?? 'Watching'
          }
        ],
        status: 'online'
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }
}
