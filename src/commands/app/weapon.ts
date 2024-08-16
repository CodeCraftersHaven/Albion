import { displayData } from '#adapters';
import { commandModule, CommandType } from '@sern/handler';
import { ApplicationCommandOptionType } from 'discord.js';
import { publishConfig } from '#sern';

export default commandModule({
  type: CommandType.Slash,
  description: 'Gets basic info on weapons.',
  plugins: [
    publishConfig({
      contexts: [0, 1, 2],
      integrationTypes: ['Guild', 'User']
    })
  ],
  options: [
    {
      name: 'list',
      description: 'Get a full list of all the weapons in the game.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'weapon_type',
          description: 'Get a list of all weapons of a specific type.',
          type: ApplicationCommandOptionType.String,
          required: false,
          autocomplete: true,
          command: {
            onEvent: [],
            execute: async (auto, { deps }) => {
              const weapons = deps.nexon.getMetadata()!.weapon;
              const focusedOption = auto.options.getFocused().toLowerCase();

              const uniqueWeaponTypes = new Set<string>();

              const filter = weapons
                .filter(w => w.weapon_type.toLowerCase().startsWith(focusedOption))
                .map(w => w.weapon_type)
                .filter(type => {
                  if (uniqueWeaponTypes.has(type)) {
                    return false;
                  } else {
                    uniqueWeaponTypes.add(type);
                    return true;
                  }
                })
                .map(type => ({ name: type, value: type }));

              await auto.respond(filter.slice(0, 25));
            }
          }
        },
        {
          name: 'weapon_tier',
          description: 'Get a list of all weapons of a specific tier.',
          type: ApplicationCommandOptionType.String,
          required: false,
          autocomplete: true,
          command: {
            onEvent: [],
            execute: async (auto, { deps }) => {
              const weapons = deps.nexon.getMetadata()!.weapon;
              const focusedOption = auto.options.getFocused().toLowerCase();

              const uniqueWeaponTiers = new Set<string>();

              const filter = weapons
                .filter(w => w.weapon_tier.toLowerCase().startsWith(focusedOption))
                .map(w => w.weapon_tier)
                .filter(type => {
                  if (uniqueWeaponTiers.has(type)) {
                    return false;
                  } else {
                    uniqueWeaponTiers.add(type);
                    return true;
                  }
                })
                .map(type => ({ name: type, value: type }));

              await auto.respond(filter.slice(0, 25));
            }
          }
        },
        {
          name: 'ammo_type',
          description: 'Get a list of all weapons of a specific ammo type.',
          type: ApplicationCommandOptionType.String,
          required: false,
          autocomplete: true,
          command: {
            onEvent: [],
            execute: async (auto, { deps }) => {
              const weapons = deps.nexon.getMetadata()!.weapon;
              const focusedOption = auto.options.getFocused().toLowerCase();

              const uniqueAmmoTypes = new Set<string>();

              const filter = weapons
                .filter(w => w.weapon_rounds_type.toLowerCase().startsWith(focusedOption))
                .map(w => w.weapon_rounds_type)
                .filter(type => {
                  if (uniqueAmmoTypes.has(type)) {
                    return false;
                  } else {
                    uniqueAmmoTypes.add(type);
                    return true;
                  }
                })
                .map(type => ({ name: type, value: type }));

              await auto.respond(filter.slice(0, 25));
            }
          }
        }
      ]
    },
    {
      name: 'stats',
      description: 'Get the stats of a particular weapon.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'weapon_name',
          description: 'Name of weapon to view info about.',
          type: ApplicationCommandOptionType.String,
          autocomplete: true,
          required: true,
          command: {
            onEvent: [],
            execute: async (autocomplete, { deps }) => {
              const weapons = deps.nexon.getMetadata()!.weapon;

              const focusedOption = autocomplete.options.getFocused().toLowerCase();

              const filteredWeapons = weapons
                .filter(weapon => weapon.weapon_name.toLowerCase().startsWith(focusedOption))
                .map(weapon => ({ name: weapon.weapon_name, value: weapon.weapon_id }));

              const choices = filteredWeapons.slice(0, 25);

              await autocomplete.respond(choices);
            }
          }
        },
        {
          name: 'level',
          description: 'Find stats of a weapon by level. 1-160 (Default is 1)',
          type: ApplicationCommandOptionType.Integer,
          min_value: 1,
          max_value: 160,
          required: false
        }
      ]
    }
  ],
  execute: async (ctx, { deps }) => {
    const meta = deps.nexon.getMetadata()!;
    const weapons = meta.weapon;
    const base_stats = meta.stat;
    const { options } = ctx.interaction;
    const sub = options.getSubcommand();

    const subs = {
      list: async () => {
        const [str, str1, str2] = [
          options.getString('weapon_type', false),
          options.getString('weapon_tier', false),
          options.getString('ammo_type', false)
        ];

        let title = '';
        let description = '';
        let filteredWeapons = weapons;

        if (str) {
          filteredWeapons = filteredWeapons.filter(w => w.weapon_type === str);
        }
        if (str1) {
          filteredWeapons = filteredWeapons.filter(w => w.weapon_tier === str1);
        }
        if (str2) {
          filteredWeapons = filteredWeapons.filter(w => w.weapon_rounds_type === str2);
        }

        if (str || str1 || str2) {
          title = 'List of weapons based on your query';
          if (str) description += `**Weapon Type**: ${str}\n`;
          if (str1) description += `**Weapon Tier**: ${str1}\n`;
          if (str2) description += `**Ammo Type**: ${str2}\n`;
          description += `\n**__Weapons__:**\n` + filteredWeapons.map(w => w.weapon_name).join('\n');
        } else {
          title = 'List of all weapons in the game';
          description = weapons.map(w => w.weapon_name).join('\n');
        }
        if (filteredWeapons.length < 1) {
          description = 'No weapons were found matching your query.';
        }
        const listDisplay = displayData({
          user: ctx.user,
          title: filteredWeapons.length < 1 ? '' : title,
          description
        });

        return await ctx.reply({
          embeds: [listDisplay],
          ephemeral: true
        });
      },
      stats: async () => {
        const id = options.getString('weapon_name', true),
          level = options.getInteger('level', false) || 1;

        const currentWeapon = weapons.find(w => w.weapon_id === id)!;
        const weaponDisplay = displayData({
          user: ctx.user,
          title: currentWeapon.weapon_name! + ' Base Stats',
          image: currentWeapon.image_url!,
          description: `At Level: ${level}, ${currentWeapon.weapon_name}'s Firearm Attack Power is ${
            currentWeapon.firearm_atk.find(f => f.level === level)?.firearm[0].firearm_atk_value
          }.`,
          fields: [
            {
              name: 'Weapon Type',
              value: currentWeapon.weapon_type,
              inline: false
            },
            {
              name: 'Weapon Tier',
              value: currentWeapon.weapon_tier,
              inline: false
            },
            {
              name: 'Ammounition Type',
              value: currentWeapon.weapon_rounds_type,
              inline: false
            },
            {
              name: 'Stats:',
              value: currentWeapon.base_stat
                .map(stat => {
                  const st = base_stats.find(s => s.stat_id === stat.stat_id);
                  return `${st?.stat_name}: ${stat.stat_value}`;
                })
                .join('\n'),
              inline: true
            }
          ]
          // thumbnail: `${currentWeapon.base_stat}`
        });
        return await ctx.reply({
          ephemeral: true,
          embeds: [weaponDisplay]
        });
      }
    };

    switch (sub) {
      case 'list':
        await subs.list();
        break;
      case 'stats':
        await subs.stats();
        break;
    }
  }
});
