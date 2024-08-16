import { ids, joinEmbed } from '#adapters';
import { discordEvent, Services } from '@sern/handler';
import { Events, TextChannel } from 'discord.js';

export default discordEvent({
  name: Events.ClientReady,
  async execute() {
    const [client, logger] = Services('@sern/client', '@sern/logger');
    logger.success(`[CLIENT]- ${client.user!.tag} is online!`);
    const botLogsChannel = (await client.guilds.cache
      .get(ids.main_guild_id)
      ?.channels.fetch(ids.channel_ids['bot-logs'])) as TextChannel;
    const messages = await botLogsChannel.messages.fetch();

    for (const [g, guild] of client.guilds.cache) {
      let sendEmbed = true;

      for (const [messageId, message] of messages) {
        const embed = message.embeds[0];
        if (!embed) continue;

        const field = embed.fields.find(f => f.name === 'Guild');

        if ((field && field.value.includes(`${guild.name}`)) || guild.id !== ids.main_guild_id) {
          sendEmbed = false;
          break;
        }
      }

      if (sendEmbed) {
        try {
          const embed = await joinEmbed(guild);
          await botLogsChannel.send({ embeds: [embed] });
        } catch (error: any) {
          let entry = `[Ready Event] - Failed to send embed for guild: ${guild.name}, Error: ${error.message}`;
          logger.warn(entry);
        }
      }
    }
  }
});
