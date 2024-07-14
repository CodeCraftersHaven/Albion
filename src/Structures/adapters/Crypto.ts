import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'crypto';

export class Crypto {
  private decryptedApiKeys: Map<string, string> = new Map();
  private tokenMap: Map<string, string> = new Map();

  protected static deriveKey(passphrase: string): Buffer {
    const salt = 'unique_salt';
    const iterations = 100000;
    const keyLength = 32;
    return pbkdf2Sync(passphrase, salt, iterations, keyLength, 'sha256');
  }

  protected generateToken() {
    return randomBytes(16);
  }

  protected generateKey() {
    return randomBytes(32).toString('hex');
  }

  protected passEncrypt(text: string, passphrase: string): string {
    const iv = this.generateToken();
    const key = Crypto.deriveKey(passphrase);
    if (key.length !== 32) {
      throw new Error('Invalid key length. Expected 32 bytes (256 bits).');
    }
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  protected passDecrypt(text: string, passphrase: string): string {
    const [ivHex, encryptedText] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = Crypto.deriveKey(passphrase);
    const encrypted = Buffer.from(encryptedText, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted).toString('utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  protected keyEncrypt(text: string, passphrase: string): string {
    const iv = this.generateToken();
    const key = Buffer.from(passphrase, 'hex');
    if (key.length !== 32) {
      throw new Error('Invalid key length. Expected 32 bytes (256 bits).');
    }
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  protected keyDecrypt(text: string, encryptionKey: string): string {
    const [ivHex, encryptedText] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(encryptionKey, 'hex');
    const encrypted = Buffer.from(encryptedText, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted).toString('utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  protected setToken(userId: string, token: string) {
    this.tokenMap.set(userId, token);
  }

  protected getToken(userId: string): string | undefined {
    return this.tokenMap.get(userId);
  }

  protected setDecryptedApiKey(token: string, apiKey: string) {
    this.decryptedApiKeys.set(token, apiKey);
  }

  protected getDecryptedApiKey(token: string): string | undefined {
    return this.decryptedApiKeys.get(token);
  }

  protected deleteToken(userId: string) {
    this.tokenMap.delete(userId);
  }

  protected deleteDecryptedApiKey(token: string) {
    this.decryptedApiKeys.delete(token);
  }
}
