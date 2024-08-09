import { Cooldowns } from '#adapters';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';

export class Albion extends Client {
  private actsIndex = 0;
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
      await this.updateStatus();
      setInterval(async () => {
        await this.updateStatus();
      }, 15 * 60 * 1000);
    });
    this.login();
  }

  private async updateStatus() {
    try {
      let uniqueMembers = new Set();
      let descendants = new Set();
      let count = 0;
      for (const guild of this.guilds.cache.values()) {
        count++;
        const members = await guild.members.fetch();
        members.forEach(member => {
          if (!member.user.bot && !uniqueMembers.has(member.user.id)) {
            const isPlayingDescendant = member.presence?.activities.some(
              activity => activity.name === 'The First Descendant'
            );
            if (isPlayingDescendant) {
              descendants.add(member.user.id);
            }
            uniqueMembers.add(member.user.id);
          }
        });
      }

      const d = descendants.size;
      const m = uniqueMembers.size;
      let acts = [
        {
          name: `over ${d === 1 ? d + ' Descendant' : d + ' Descendants'}`,
          type: ActivityType.Watching
        },
        {
          name: `over ${m === 1 ? m + ' user' : m + ' users'}`,
          type: ActivityType.Watching
        },
        {
          name: `over ${count === 1 ? count + ' server' : count + ' servers'}`,
          type: ActivityType.Watching
        }
      ];

      const currentAct = acts[this.actsIndex];
      this.actsIndex = (this.actsIndex + 1) % acts.length;

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
