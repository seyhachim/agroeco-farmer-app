import { User } from "@supabase/supabase-js";

export default function UserInfo({ user }: { user: User | null }) {
  const firstName =
    user?.user_metadata?.first_name ??
    user?.user_metadata?.full_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "";

  const lastName = user?.user_metadata?.last_name ?? "";

  return (
    <div>
      <h1 className="text-lg font-semibold">
        Hello, {firstName} {lastName} 👋
      </h1>
    </div>
  );
}
