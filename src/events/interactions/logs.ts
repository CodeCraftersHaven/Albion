import { ids } from '#adapters';
import { discordEvent, Services } from '@sern/handler';
import { Events, InteractionType, TextChannel } from 'discord.js';

const MAX_MESSAGE_LENGTH = 2000;
const CODE_BLOCK_CHARS = 7;

export default discordEvent({
  name: Events.InteractionCreate,
  execute: async interaction => {
    const [client, logger] = Services('@sern/client', '@sern/logger');
    let entry = '';

    if (interaction.inGuild()) {
      const guild = client.guilds.cache.get(interaction.guildId);
      if (guild) {
        entry += `[${guild.name}] - `;
      } else {
        entry += `[User Installed Interaction] - `;
      }
    } else {
      entry += `[DMs] - `;
    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) return;
    if (interaction.isCommand()) {
      entry += `Command: ${interaction.commandName} was used by ${interaction.user.username}`;
    }
    if (interaction.isAnySelectMenu()) {
      entry += `SelectMenu: ${interaction.customId} was used by ${interaction.user.username}`;
    }
    if (interaction.isButton()) {
      entry += `Button: ${interaction.customId} was used by ${interaction.user.username}`;
    }
    if (interaction.isModalSubmit()) {
      entry += `Modal: ${interaction.customId} was submitted by ${interaction.user.username}`;
    }
    if (interaction.isContextMenuCommand()) {
      entry += `Context Menu Command: ${interaction.commandName} was used by ${interaction.user.username}`;
    }
    entry += ` at ${new Date().toLocaleString()}\n`;

    const mainGuild = client.guilds.cache.get(ids.main_guild_id);
    if (!mainGuild) return;

    let logsChannel: TextChannel | null = null;
    try {
      logsChannel = (await mainGuild?.channels.fetch())?.get(ids.channel_ids['bot-logs']) as TextChannel;
      if (!logsChannel) return;

      const messages = await logsChannel.messages.fetch({ limit: 1 });
      const lastMessage = messages.first();

      if (lastMessage && lastMessage.author.id === client.user?.id && lastMessage.content.startsWith('```ts\n')) {
        const currentContent = lastMessage.content.slice(5, -3); // Remove ```ts\n and ```
        if (currentContent.length + entry.length + CODE_BLOCK_CHARS <= MAX_MESSAGE_LENGTH) {
          await lastMessage.edit('```ts\n' + currentContent + entry + '```');
        } else {
          await logsChannel.send('```ts\n' + entry + '```');
        }
      } else {
        await logsChannel.send('```ts\n' + entry + '```');
      }
    } catch (error: any) {
      logger.error(error);
      if (logsChannel) {
        await logsChannel.send(error.message);
      }
    }
  }
});
