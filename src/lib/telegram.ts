import WebApp from "@twa-dev/sdk";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string; // This is the profile photo URL
};

export const getTelegramUser = (): TelegramUser | null => {
  try {
    WebApp.ready();
    const tgUser = WebApp.initDataUnsafe?.user;
    if (!tgUser) return null;

    return {
      id: tgUser.id,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name,
      username: tgUser.username,
      language_code: tgUser.language_code,
      photo_url: tgUser.photo_url,
    };
  } catch {
    return null;
  }
};
