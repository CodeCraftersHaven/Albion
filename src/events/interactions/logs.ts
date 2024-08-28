import { ids } from '#adapters';
import { PrismaClient } from '@prisma/client';
import { discordEvent, Services } from '@sern/handler';
import { ChannelType, Events, InteractionType, Message, TextChannel } from 'discord.js';

export default discordEvent({
  name: Events.InteractionCreate,
  execute: async interaction => {
    const [client, logger, prisma] = Services('@sern/client', '@sern/logger', 'prisma');
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
    entry += ` at ${new Date().toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      dateStyle: 'short',
      timeStyle: 'medium'
    })}\n`;

    const mainGuild = client.guilds.cache.get(ids.main_guild_id);
    if (!mainGuild) return;

    let db = await prisma.interactionLogger.findFirst({
      where: {
        id: mainGuild.id
      }
    });

    let logsChannel: TextChannel | null = null;
    try {
      logsChannel = (await mainGuild.channels.fetch())
        .filter(c => c!.type === ChannelType.GuildText)
        .get(ids.channel_ids['bot-logs']) as TextChannel;
      if (!logsChannel) return;

      let lastMessage: Message | null = null;
      if (db?.messageId) {
        lastMessage = await logsChannel.messages.fetch(db.messageId).catch(() => null);
      }

      if (lastMessage && lastMessage.author.id === client.user!.id && lastMessage.content.startsWith('```ts\n')) {
        const currentContent = lastMessage.content.slice(5, -3);
        const newContent = currentContent + entry;

        if (newContent.length + 7 <= 2000) {
          await lastMessage.edit('```ts\n' + currentContent + entry + '```');
        } else {
          await sendNewMessage(logsChannel, entry, prisma, mainGuild.id);
        }
      } else {
        await sendNewMessage(logsChannel, entry, prisma, mainGuild.id);
      }
    } catch (error: any) {
      logger.error(error);
      if (logsChannel) {
        await logsChannel.send(error.message);
      }
    }
  }
});
async function sendNewMessage(channel: TextChannel, entry: string, prisma: PrismaClient, guildId: string) {
  const message = await channel.send('```ts\n' + entry + '```');
  await prisma.interactionLogger.upsert({
    where: {
      id: guildId
    },
    create: {
      id: guildId,
      messageId: message.id
    },
    update: {
      messageId: message.id
    }
  });
}
