import { discordEvent, Service } from '@sern/handler';
import { Events, InteractionType } from 'discord.js';
import { appendFile } from 'fs';
import { promisify } from 'util';

export default discordEvent({
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    const logger = Service('@sern/logger');
    const appendFileAsync = promisify(appendFile);
    const client = interaction.client;
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
    try {
      await appendFileAsync('assets/logs.txt', entry);
    } catch (error) {
      logger.info('Error while writing to log file: ' + error);
    }
  }
});
