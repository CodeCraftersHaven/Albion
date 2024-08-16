import { Init, Service } from '@sern/handler';
import { CooldownTypes, cooldownDurations, InternalCooldownConfig, Prisma, owners } from '#adapters';

export class Cooldowns implements Init {
  private _cooldowns: Map<string, Date> = new Map();
  private _errorMessage = 'Sorry, this {FEATURE} is currently on cooldown. Will be available again {TIME}.';
  private _botOwnersBypass = true;

  constructor(private prisma: Prisma) {}

  private get cooldowns() {
    return this.prisma.cooldowns;
  }
  private get _logger() {
    return Service('@sern/logger');
  }
  async init() {
    try {
      await this.cooldowns.deleteMany({
        where: {
          expires: { lt: new Date() }
        }
      });

      const results = await this.cooldowns.findMany({});
      for (const result of results) {
        const { id, expires } = result;
        this._cooldowns.set(id, expires);
      }
      this._logger.success('[COOLDOWNS]- Successfully Loaded Cooldowns!');
    } catch (error: any) {
      return this._logger.error(`[COOLDOWNS]- Cooldowns unavailable due to: ${error.message}.`);
    }
  }

  public async cancelCooldown(cooldownUsage: InternalCooldownConfig) {
    const key = this.getKey(cooldownUsage);

    this._cooldowns.delete(key);

    await this.cooldowns.delete({ where: { id: key } });
  }

  public verifyCooldown(duration: number | [number, 's' | 'm' | 'd' | 'h']): number {
    if (typeof duration === 'number') {
      return duration;
    }
    if (Array.isArray(duration)) {
      if (duration.length < 1 || duration.length > 2) {
        throw new Error(`Duration "${duration}" is an invalid duration. Please use "[10, "s"]", "[15, "m]" etc.`);
      }
      const [amount, unit] = duration;
      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error('amount must be a whole number greater than 0.');
      }
      if (!cooldownDurations[unit]) {
        throw new Error(
          `Unknown duration type "${unit}". Please use one of the following: ${Object.keys(cooldownDurations)}`
        );
      }
      return amount * cooldownDurations[unit];
    }
    throw new Error('Invalid cooldown duration provided.');
  }

  private getKey(cooldownUsage: InternalCooldownConfig): string {
    const { cooldownType, userId, actionId, guildId = '', channelId } = cooldownUsage;

    const isPerUser = cooldownType === CooldownTypes.perUser;
    const isPerUserPerGuild = cooldownType === CooldownTypes.perUserPerGuild;
    const isPerGuild = cooldownType === CooldownTypes.perGuild;
    const isGlobal = cooldownType === CooldownTypes.global;
    const isPerChannel = cooldownType === CooldownTypes.perChannel;
    const isPerUserPerChannel = cooldownType === CooldownTypes.perUserPerChannel;

    if ((isPerUserPerGuild || isPerGuild) && !guildId) {
      throw new Error(`Invalid cooldown type "${cooldownType}" used outside of a guild.`);
    }

    return isGlobal
      ? actionId
      : isPerGuild
      ? `${guildId}-${actionId}`
      : isPerUser
      ? `${userId}-${actionId}`
      : isPerUserPerGuild
      ? `${userId}-${guildId}-${actionId}`
      : isPerChannel
      ? `${channelId}-${actionId}`
      : isPerUserPerChannel
      ? `${userId}-${channelId}-${actionId}`
      : 'ERROR';
  }

  async start(cooldownUsage: InternalCooldownConfig) {
    const { duration, userId } = cooldownUsage;
    if (this._botOwnersBypass === true && owners.includes(userId)) {
      return true;
    }
    try {
      const seconds = this.verifyCooldown(duration);
      const key = this.getKey(cooldownUsage);
      const _exists = this._cooldowns.get(key);

      if (!_exists) {
        //new cooldown
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + seconds);
        this._cooldowns.set(key, expires);
        await this.cooldowns.create({
          data: {
            id: key,
            expires,
            count: 0
          }
        });
        return true;
      } else {
        //update cooldown
        const _remainingTime = Math.max(_exists.getTime() - Date.now(), 0);
        const newSeconds = new Date().getSeconds();
        const _newExpires = new Date(_remainingTime + seconds + newSeconds);

        if (new Date() > _exists) {
          //delete key from map
          this._cooldowns.delete(key);
          //delete key from database
          await this.cooldowns.delete({
            where: {
              id: key
            }
          });
          //allow user to run command
          return true;
        }

        let str = '';
        const current = await this.cooldowns.findFirst({
          where: { id: key }
        });
        if (current && current.count === 0) {
          str = this._errorMessage
            .replace('{TIME}', `<t:${Math.floor(_exists.getTime() / 1000)}:R>`)
            .replace('{FEATURE}', cooldownUsage.actionId.split('_')[0]);
          await this.cooldowns.update({
            where: { id: key },
            data: {
              count: {
                increment: 1
              }
            }
          });
        }
        if (current && current.count === 1) {
          _newExpires.setSeconds(_newExpires.getSeconds() + seconds + _remainingTime);

          this._cooldowns.set(key, _newExpires);
          await this.cooldowns.update({
            where: { id: key },
            data: {
              count: {
                increment: 1
              }
            }
          });
          str = 'Try that again before your cooldown expires and your cooldown time will be increased!';
        }
        if (current?.count && current.count > 1) {
          await this.cooldowns.update({
            where: { id: key },
            data: {
              count: {
                increment: 1
              },
              expires: _newExpires
            }
          });
          str = `Congrats on your inability to obey cooldown times! Your new time is: <t:${Math.floor(
            _newExpires.getTime() / 1000
          )}:R>`;
        }
        return str;
      }
    } catch (error) {
      const errMessage = '[COOLDOWNS]- Error occured in cooldowns! ' + error;
      console.error(errMessage);
      const reply = 'There was an error implementing cooldowns! This error has been sent to the Developer!';
      const main = `\`\`\`\n${errMessage}\n\`\`\``;
      return {
        reply,
        main
      };
    }
  }
}
