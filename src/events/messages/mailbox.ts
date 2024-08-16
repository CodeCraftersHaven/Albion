import { discordEvent } from '@sern/handler';

export default discordEvent({
  name: 'messageCreate',
  async execute(message) {}
});
