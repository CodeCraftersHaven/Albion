import { Sern, makeDependencies } from '@sern/handler';
import { Albion } from '#bot';
import { env, Sparky } from '#sern';
import { Cooldowns, TFD, Prisma } from '#adapters';
import { Publisher } from '@sern/publisher';

await makeDependencies(({ add, swap }) => {
  const logger = new Sparky('debug', 'highlight');
  const prisma = new Prisma(logger);
  const cooldown = new Cooldowns(prisma);
  const client = new Albion(cooldown);
  const nexon = new TFD(env.TFD_API_KEY, prisma, logger);
  swap('@sern/logger', logger);
  add('prisma', prisma);
  add('cooldowns', cooldown);
  add('@sern/client', client);
  add('nexon', nexon);
  add('publisher', (deps) => new Publisher(deps['@sern/modules'], deps['@sern/emitter'], deps['@sern/logger']));
});

Sern.init({
  commands: 'dist/commands',
  events: 'dist/events'
});
