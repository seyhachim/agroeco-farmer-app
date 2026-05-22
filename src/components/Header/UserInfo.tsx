import { TelegramUser } from "@/lib/telegram";

export default function UserInfo({ user }: { user: TelegramUser | null }) {
  if (!user) return <p>Loading Telegram user...</p>;

  return (
    <div>
      <h1>
        Hello, {user.first_name} {user.last_name || ""} 👋
      </h1>
      {/* <p>Username: @{user.username || "No username"}</p>
      <p>User ID: {user.id}</p> */}
    </div>
  );
}
