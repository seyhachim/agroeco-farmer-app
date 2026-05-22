import * as crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface VerifiedData {
  user: TelegramUser;
  auth_date: number;
}

export function verifyTelegramWebAppData(
  telegramInitData: string
): VerifiedData | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return null;

  const encoded = decodeURIComponent(telegramInitData);
  const params = new URLSearchParams(encoded);
  const data = Object.fromEntries(params.entries());

  const hash = data.hash;
  delete data.hash;

  if (!hash || !data.user) return null;

  const dataCheckString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash === hash) {
    return {
      user: JSON.parse(data.user),
      auth_date: parseInt(data.auth_date || "0"),
    };
  }
  return null;
}
