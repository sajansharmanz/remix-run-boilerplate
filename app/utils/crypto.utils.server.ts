import env from "~/config/environment.config.server";

export const hashString = async (value: string): Promise<string> => {
  const crypto = await import("node:crypto");

  return crypto.createHash("sha256").update(value).digest("hex");
};

export const generateRandomString = async (): Promise<string> => {
  const crypto = await import("node:crypto");

  return crypto.randomBytes(32).toString("hex");
};

export const encrypt = async (text: string) => {
  const crypto = await import("node:crypto");

  const iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(env.ENCRYPTION_SECRET, "salt", 32);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex"),
  };
};

export const decrypt = async (content: string, iv: string, authTag: string) => {
  const crypto = await import("node:crypto");

  const key = crypto.scryptSync(env.ENCRYPTION_SECRET, "salt", 32);

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  const decrpyted = Buffer.concat([
    decipher.update(content, "hex"),
    decipher.final(),
  ]);

  return decrpyted.toString();
};
