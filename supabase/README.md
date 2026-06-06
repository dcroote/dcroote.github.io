# Supabase post likes

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`likes.sql`](likes.sql) once. The file begins with a **RESET** block that drops prior like objects so you can re-run the whole script safely while iterating.
3. In **Integrations → Data API**, expose only the **`public`** schema (do not expose `likes_private`).
4. Copy credentials into [`_config.yml`](../_config.yml):
   - **`supabase_url`** — Project API base URL (HTTPS, no trailing slash), e.g. `https://abcdefghijklmnop.supabase.co` from the project **Connect** dialog or homepage.
   - **`supabase_publishable_key`** — **Settings → API Keys** → **Publishable** (`sb_publishable_…`). Never commit the **Secret** key.
5. Rebuild or deploy the site. The like button stays hidden until both values are set.
