import { displayData } from '#adapters';
import { commandModule, CommandType, Service } from '@sern/handler';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';

export default commandModule({
  type: CommandType.Slash,
  description: 'Returns the recommended module setup for void battles.',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'descendant',
      description: 'Which descendant will you use for this battle?',
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (auto) => {
          const descendants = Service('nexon').getMetadata()!.descendant;
          const focusedOption = auto.options.getFocused().toLowerCase();

          const filter = descendants
            .filter((d) => d.descendant_name.toLowerCase().startsWith(focusedOption))
            .map((type) => ({ name: type.descendant_name, value: type.descendant_id }));

          await auto.respond(filter.slice(0, 25));
        }
      }
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'weapon',
      description: 'Which weapon will you use for this battle?',
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (auto) => {
          const weapons = Service('nexon').getMetadata()!.weapon;
          const focusedOption = auto.options.getFocused().toLowerCase();

          const filter = weapons
            .filter((w) => w.weapon_name.toLowerCase().startsWith(focusedOption))
            .map((type) => ({ name: type.weapon_name, value: type.weapon_id }));

          await auto.respond(filter.slice(0, 25));
        }
      }
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'void_battle',
      description: 'Which void battle are you entering?',
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (auto) => {
          const voidBattles = Service('nexon').getMetadata()!.voidBattle;
          const focusedOption = auto.options.getFocused().toLowerCase();

          const filter = voidBattles
            .filter((v) => v.void_battle_name.toLowerCase().startsWith(focusedOption))
            .map((type) => ({ name: type.void_battle_name, value: type.void_battle_id }));

          await auto.respond(filter.slice(0, 25));
        }
      }
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'period',
      description: 'Query period to return data based on past wins.',
      required: true,
      choices: [
        {
          name: 'last 7 days',
          value: '0'
        },
        {
          name: 'last 30 days',
          value: '1'
        },
        {
          name: 'all time',
          value: '2'
        }
      ]
    }
  ],
  execute: async (ctx, { deps }) => {
    const { options } = ctx.interaction;
    const [des, weapon, battle, period] = [
      options.getString('descendant', true),
      options.getString('weapon', true),
      options.getString('void_battle', true),
      options.getString('period', true)
    ];

    try {
      const { getMetadata, moduleRecommendation } = deps.nexon;
      const recommendation = await moduleRecommendation(des, weapon, battle, period);
      const { descendant, weapon: weapons, voidBattle, module } = getMetadata()!;
      const descendantName = descendant.find((d) => d.descendant_id === des)?.descendant_name;
      const weaponName = weapons.find((w) => w.weapon_id === weapon)?.weapon_name;
      const voidBattleName = voidBattle.find((vb) => vb.void_battle_id === battle)?.void_battle_name;
      const recommendedDescendantModules = recommendation.descendant.recommendation
        .map((rec) => {
          const moduleName = module.find((mod) => mod.module_id === rec.module_id)?.module_name;
          return moduleName ? moduleName : `Module ID: ${rec.module_id}`;
        })
        .join(', ');

      const recommendedWeaponModules = recommendation.weapon.recommendation
        .map((rec) => {
          const moduleName = module.find((mod) => mod.module_id === rec.module_id)?.module_name;
          return moduleName ? moduleName : `Module ID: ${rec.module_id}`;
        })
        .join(', ');
      const embeds = [
        displayData({
          user: ctx.user,
          title: `Recommended Module Setup for ${voidBattleName}`,
          fields: [
            {
              inline: false,
              name: `${descendantName} Modules:`,
              value: recommendedDescendantModules
            },
            {
              inline: false,
              name: `${weaponName} Modules:`,
              value: recommendedWeaponModules
            }
          ]
        })
      ];

      return await ctx.reply({
        embeds,
        ephemeral: true
      });
    } catch (error) {
      await ctx.reply({ content: 'Failed to fetch module recommendations. Please try again later.', ephemeral: true });
    }
  }
});
