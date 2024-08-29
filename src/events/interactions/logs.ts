import { ids } from '#adapters';
import { discordEvent, Services } from '@sern/handler';
import { ChannelType, Events, InteractionType, TextChannel } from 'discord.js';
const _cache: Map<number, string> = new Map();

export default discordEvent({
  name: Events.InteractionCreate,
  execute: async interaction => {
    const [client, logger, prisma] = Services('@sern/client', '@sern/logger', 'prisma');

    const newEntry = () => {
      let entry = '';

      if (interaction.inGuild()) {
        const guild = client.guilds.cache.get(interaction.guildId);
        if (guild) {
          entry = `[${guild.name}] - `;
        } else {
          entry = `[User Installed Interaction] - `;
        }
      } else {
        entry = `[DMs] - `;
      }

      if (interaction.type === InteractionType.ApplicationCommandAutocomplete) return '';
      if (interaction.isCommand()) {
        entry += `Command: ${interaction.commandName} was used by ${interaction.user.username}`;
      }
      if (interaction.isAnySelectMenu()) {
        entry += `Select Menu: ${interaction.customId} was used by ${interaction.user.username}`;
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
      const now = new Date();
      const timestampString = now.toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      entry += ` at ${timestampString.replace('at ', '')} CDT`;
      return entry;
    };

    const newLogEntry = newEntry();
    if (newLogEntry) {
      const timestamp = Date.now(); // Use timestamp as a unique key
      _cache.set(timestamp, newLogEntry);
    }

    if (_cache.size > 4) {
      const mainGuild = client.guilds.cache.get(ids.main_guild_id);
      if (!mainGuild) return;

      let db = await prisma.interactionLogger.findFirst({
        where: {
          id: mainGuild.id
        }
      });
      const sendNewMessage = async (channel: TextChannel) => {
        const messageContent = Array.from(_cache.values()).join('\n');
        const message = await channel.send(`\`\`\`ts\n${messageContent}\`\`\``);

        await prisma.interactionLogger.upsert({
          where: {
            id: channel.guildId
          },
          create: {
            id: channel.guildId,
            messageId: message.id
          },
          update: {
            messageId: message.id
          }
        });
        _cache.clear();
        return message;
      };

      let logsChannel: TextChannel | null = null;
      try {
        logsChannel = (await mainGuild.channels.fetch())
          .filter(c => c!.type === ChannelType.GuildText)
          .get(ids.channel_ids['bot-logs']) as TextChannel;
        if (!logsChannel) return;
        if (!db || !db.messageId) {
          return await sendNewMessage(logsChannel);
        }
        let lastMessage = (await logsChannel.messages.fetch({ cache: false })).get(db.messageId);

        if (lastMessage && lastMessage.author.id === client.user!.id && lastMessage.content.startsWith('```ts')) {
          const currentContent = lastMessage.content.slice(6, -3);
          const newContent = `${currentContent}\n${Array.from(_cache.values()).join('\n')}`.trim();

          if (newContent.length + 9 <= 2000) {
            await lastMessage.edit(`\`\`\`ts\n${newContent}\`\`\``);
          } else {
            await sendNewMessage(logsChannel);
          }
          _cache.clear();
        } else {
          await sendNewMessage(logsChannel);
        }
      } catch (error: any) {
        logger.error(error);
        if (logsChannel) {
          if (error.message === 'Unknown Message') {
            await sendNewMessage(logsChannel);
          } else {
            await logsChannel.send(error.message);
          }
        }
      }
    }
  }
});
