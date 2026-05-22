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
