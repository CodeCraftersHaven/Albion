import { existsSync, readFileSync } from 'fs';
function load<T extends object>(
  //create an object of strings from the .env file.
  struct: Struct<T>,
  //find your desired .env file <Always in cwd>
  path: string = '.env',
  //check if a certain var is within load and env (if not throw an error)
  inject: boolean = true
): T {
  const out: T = {} as never;

  if (!existsSync(path)) {
    throw new Error(`Cannot read contents of '${path}': File does not exist`);
  }

  const file = readFileSync(path);
  const lines = file.toString().split('\n');

  const raw: Record<string, string> = {};

  for (const line of lines) {
    const [key, value] = [line.split('=')[0], line.split('=').slice(1).join('=')] as [string, string];

    let real_value = value;

    try {
      real_value = JSON.stringify(JSON.parse(value));
    } catch {
      void real_value;
    }

    raw[key] = value;
  }

  for (const key in struct) {
    if (!(key in raw)) {
      throw new Error(`Cannot map key '${key}': Key does not exist`);
    }

    // safety(as): assertion above guarantees string
    out[key] = struct[key](raw[key] as string);
  }

  if (inject) {
    Object.assign(process.env, out);
  }

  return out;
}

type Struct<T extends object> = {
  [P in keyof T]: (str: string) => T[P];
};

export const env = load({
  OWNER_IDS: Array<string>,
  DISCORD_TOKEN: String,
  MONGO_URI: String,
  NODE_ENV: String,
  TFD_API_KEY: String
});
