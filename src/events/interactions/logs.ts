import { ids } from '#adapters';
import { discordEvent, Services } from '@sern/handler';
import { ChannelType, Events, InteractionType, Message, TextChannel } from 'discord.js';
const _cache: Map<number, string> = new Map();

export default discordEvent({
  name: Events.InteractionCreate,
  execute: async interaction => {
    const [client, logger, prisma] = Services('@sern/client', '@sern/logger', 'prisma');

    const newEntry = () => {
      let entry = interaction.inGuild()
        ? client.guilds.cache.get(interaction.guildId)
          ? `[${client.guilds.cache.get(interaction.guildId)!.name}] - `
          : `[User Installed Interaction] - `
        : `[DMs] - `;

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
      entry += ` at ${timestampString.replace('at ', '')} CST`;
      return entry;
    };

    const newLogEntry = newEntry();
    if (newLogEntry) {
      const timestamp = Date.now();
      _cache.set(timestamp, newLogEntry);
    }

    const mainGuild = client.guilds.cache.get(ids.main_guild_id);
    if (!mainGuild) return;

    let db = await prisma.interactionLogs.findFirst({
      where: {
        id: mainGuild.id
      },
      select: {
        lastUpdated: true,
        messageId: true
      }
    });

    const logsChannel = (await mainGuild.channels.fetch())
      .filter(c => c!.type === ChannelType.GuildText)
      .get(ids.channel_ids['bot-logs']) as TextChannel;
    if (!logsChannel) return logger.warn(`logs channel non existent`);

    const upsert = async (message: Message<true>) => {
      await prisma.interactionLogs.upsert({
        where: {
          id: message.guildId
        },
        create: {
          id: message.guildId,
          messageId: message.id,
          lastUpdated: new Date()
        },
        update: {
          messageId: message.id,
          lastUpdated: new Date()
        }
      });
    };

    const sendMessage = async () => {
      const firstEntry = _cache.values().next().value;
      if (!firstEntry) return;

      let m = await logsChannel.send(`\`\`\`ts\n${firstEntry}\`\`\``);
      await upsert(m);
      _cache.delete(_cache.keys().next().value);
    };

    const editMessage = async (messageToEdit: Message<true>, newContent: string) => {
      let m = await messageToEdit.edit(newContent);
      await upsert(m);
    };

    const lastMessage = (await logsChannel.messages.fetch({ cache: false })).get(db?.messageId ?? '');
    const timeSinceLastUpdate = db ? Date.now() - new Date(db.lastUpdated).getTime() : Infinity;

    try {
      if (!db) {
        await sendMessage();
      } else if (lastMessage && lastMessage.author.id === client.user!.id && lastMessage.content.startsWith('```ts')) {
        let messageContent = Array.from(_cache.values()).join('\n');
        const currentContent = lastMessage.content.slice(6, -3);
        const newContent = `${currentContent}\n${messageContent}`.trim();

        if (newContent.length + 9 <= 2000 && (_cache.size >= 5 || timeSinceLastUpdate >= 2 * 60 * 1000)) {
          await editMessage(lastMessage, `\`\`\`ts\n${newContent}\`\`\``);
          _cache.clear();
        }
      }
    } catch (error: any) {
      if (error.message == 'Unknown Message') {
        await sendMessage();
      }
    }
  }
});
