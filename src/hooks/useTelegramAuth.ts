"use client";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export function useTelegramUser() {
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    WebApp.ready();
    const user = WebApp.initDataUnsafe?.user;
    if (user) setTgUser(user as TelegramUser);
  }, []);

  return tgUser;
}
