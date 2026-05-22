// types/telegram-webapp.d.ts
export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
          chat?: {
            id: number;
            type: string;
            title?: string;
          };
          start_param?: string;
          auth_date: number;
          hash: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        // Add more methods if needed (e.g., sendData, MainButton, etc.)
      };
    };
  }
}
