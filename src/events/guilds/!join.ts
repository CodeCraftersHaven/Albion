import { ids, joinEmbed } from '#adapters';
import { discordEvent, Services } from '@sern/handler';
import { Events, TextChannel } from 'discord.js';

export default discordEvent({
  name: Events.GuildCreate,
  async execute(guild) {
    const [client, logger] = Services('@sern/client', '@sern/logger');
    const mainGuild = client.guilds.cache.get(ids.main_guild_id);
    const botLogsChannel = await mainGuild?.channels.fetch(ids.channel_ids['bot-logs']);
    await (botLogsChannel as TextChannel)
      .send({
        embeds: [await joinEmbed(guild)]
      })
      .catch(async err => {
        let entry = `[Guild Create Event] - Failed to send embed for guild: ${guild.name}, Error: ${err.message}\n`;
        logger.warn(entry);
      });
  }
});
