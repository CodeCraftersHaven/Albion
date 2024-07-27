import { createModal } from '#adapters';
import { commandModule, CommandType } from '@sern/handler';
import { publishConfig } from '@sern/publisher';
import { ApplicationCommandOptionType, TextInputBuilder, TextInputStyle } from 'discord.js';

export default commandModule({
  type: CommandType.Slash,
  description: 'Suggest a change or a new feature for the bot.',
  plugins: [
    publishConfig({
      contexts: [0, 1, 2],
      integrationTypes: ['Guild', 'User']
    })
  ],
  options: [
    {
      name: 'type',
      description: 'Please specify the type of change you are suggesting.',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: 'Change a current feature',
          value: 'change'
        },
        {
          name: 'New Feature Request',
          value: 'feature'
        },
        {
          name: 'Remove a current feature',
          value: 'remove'
        }
      ]
    }
  ],
  execute: async (ctx, tbd) => {
    const typeOfChange = ctx.options.getString('type', true);

    const modal = createModal(`suggestion/${typeOfChange}`, `Suggestion for the bot`, [
      new TextInputBuilder({
        custom_id: `suggestion_issue`,
        label: 'Issue',
        placeholder: 'Please provide a simple title for your suggestion.',
        required: true,
        style: TextInputStyle.Short
      }),
      new TextInputBuilder({
        custom_id: `suggestion_description`,
        label: 'Description',
        placeholder: 'Please provide details about your suggestion.',
        required: true,
        style: TextInputStyle.Paragraph
      }),
      new TextInputBuilder({
        custom_id: `suggestion_fix`,
        label: 'Fix',
        placeholder: 'Please provide details about your suggestion.',
        required: false,
        style: TextInputStyle.Paragraph
      })
    ]);
    await ctx.interaction.showModal(modal);
  }
});
