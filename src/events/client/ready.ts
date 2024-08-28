import { discordEvent, Services } from '@sern/handler';
import { Events } from 'discord.js';

export default discordEvent({
  name: Events.ClientReady,
  async execute() {
    const [client, logger] = Services('@sern/client', '@sern/logger');
    logger.success(`[CLIENT]- ${client.user!.tag} is online!`);
  }
});
