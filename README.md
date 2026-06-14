The goal:

On the Home page, detect the Telegram user (chat_id, first_name, etc.).

On the backend (/api/auth/telegram):

Check if the user exists in users + user_profiles.

If not, create them (using Supabase service key).

Return a server-generated JWT session (access_token + refresh_token).

On the frontend:

Call supabase.auth.setSession(...) with the tokens.

User is now logged in automatically.

# Display their info.
cd d:\work\agroeco-farmer-app\ai_service
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
cd d:\work\agroeco-farmer-app
npm run dev

## Admin role

One-time setup: run `supabase/sql/add_role_column.sql` in the Supabase SQL editor to add a
`role` column (`farmer` | `admin`, default `farmer`) to `user_profiles`.

Promote a user to admin by email:

```
npm run set-admin -- you@example.com
```

Admins who open `/dashboard` (the profile icon in the bottom nav) see the Admin Dashboard;
everyone else sees the regular profile dashboard.
