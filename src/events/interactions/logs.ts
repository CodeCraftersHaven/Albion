//For this to work, you need to create a new file at `cwd/assets/logs.txt`
import { discordEvent, Service } from '@sern/handler';
import { Events } from 'discord.js';
import { appendFile } from 'fs';
import { promisify } from 'util';

export default discordEvent({
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    const logger = Service('@sern/logger');
    const appendFileAsync = promisify(appendFile);

    let entry = '';
    if (interaction.isCommand()) {
      if (interaction.inGuild()) {
        entry = `[${interaction.guild?.name}] - Command: ${interaction.commandName} was used by ${
          interaction.user.username
        } at ${new Date().toLocaleString()}\n`;
      } else
        entry = `Command: ${interaction.commandName} was used by ${
          interaction.user.username
        } in dms at ${new Date().toLocaleString()}\n`;
    }
    if (interaction.isAnySelectMenu()) {
      if (interaction.inGuild()) {
        entry = `[${interaction.guild?.name}] - SelectMenu: ${interaction.customId} was used by ${
          interaction.user.username
        } at ${new Date().toLocaleString()}\n`;
      } else
        entry = `SelectMenu: ${interaction.customId} was used by ${
          interaction.user.username
        } in dms at ${new Date().toLocaleString()}\n`;
    }
    if (interaction.isButton()) {
      if (interaction.inGuild()) {
        entry = `[${interaction.guild?.name}] - Button: ${interaction.customId} was used by ${
          interaction.user.username
        } at ${new Date().toLocaleString()}\n`;
      } else
        entry = `Button: ${interaction.customId} was used by ${
          interaction.user.username
        } in dms at ${new Date().toLocaleString()}\n`;
    }
    if (interaction.isModalSubmit()) {
      if (interaction.inGuild()) {
        entry = `[${interaction.guild?.name}] - Modal: ${interaction.customId} was submitted by ${
          interaction.user.username
        } at ${new Date().toLocaleString()}\n`;
      } else
        entry = `Modal: ${interaction.customId} was submitted by ${
          interaction.user.username
        } in dms at ${new Date().toLocaleString()}\n`;
    }
    if (interaction.isContextMenuCommand()) {
      if (interaction.inGuild()) {
        entry = `[${interaction.guild?.name}] - Context Menu Command: ${interaction.commandName} was used by ${
          interaction.user.username
        } at ${new Date().toLocaleString()}\n`;
      } else
        entry = `Context Menu Command: ${interaction.commandName} was used by ${
          interaction.user.username
        } in dms at ${new Date().toLocaleString()}\n`;
    }

    try {
      await appendFileAsync('assets/logs.txt', entry);
    } catch (error) {
      logger.info('Error while writing to log file: ' + error);
    }
  }
});
