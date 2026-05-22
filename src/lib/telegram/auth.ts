// lib/telegram/auth.ts
import crypto from "crypto";

// Define the shape of the user data received from Telegram
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_bot?: boolean;
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Verifies the Telegram Mini App initData hash against the BOT_TOKEN.
 * @param initData The raw initData string received from the client.
 * @returns {{isValid: boolean, user: TelegramUser | null}}
 */
export function verifyTelegramInitData(initData: string): {
  isValid: boolean;
  user: TelegramUser | null;
} {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not set.");
    return { isValid: false, user: null };
  }

  const parts = initData.split("&");
  const hashPart = parts.find((part) => part.startsWith("hash="));

  if (!hashPart) return { isValid: false, user: null };

  const expectedHash = hashPart.replace("hash=", "");

  // 1. Prepare data string (exclude hash, sort alphabetically)
  const dataCheckArr = parts.filter((part) => !part.startsWith("hash=")).sort();

  const dataCheckString = dataCheckArr.join("\n");

  // 2. Create the secret key: HMAC-SHA256(token, 'WebAppData')
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

  // 3. Calculate the hash: HMAC-SHA256(secretKey, dataCheckString)
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // 4. Compare
  if (calculatedHash !== expectedHash) {
    return { isValid: false, user: null };
  }

  // 5. Parse user data if valid
  const urlParams = new URLSearchParams(initData);
  const userJson = urlParams.get("user");

  try {
    const telegramUser: TelegramUser = userJson ? JSON.parse(userJson) : null;
    return { isValid: true, user: telegramUser };
  } catch (e) {
    console.error("Failed to parse Telegram user JSON:", e);
    return { isValid: false, user: null };
  }
}
