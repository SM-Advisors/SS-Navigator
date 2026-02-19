# Supabase Project Setup Guide
## SS Navigator — Sebastian Strong Foundation

---

## Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Select your organization
4. Fill in:
   - **Name:** `ss-navigator`
   - **Database Password:** Generate a strong password and save it securely
   - **Region:** US East (closest to Miami, FL)
5. Click **Create new project** and wait ~2 minutes

---

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings > API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Create `.env.local` in the project root:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
   ```

---

## Step 3: Run Database Migrations

Install the Supabase CLI if needed:
```bash
npm install -g supabase
```

Link to your project:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```

Run the migrations (in order):
```bash
supabase db push
```

Or manually run each SQL file in the Supabase SQL Editor:
1. `supabase/migrations/001_core_schema.sql`
2. `supabase/migrations/002_resources.sql`
3. `supabase/migrations/003_ai_conversations.sql`
4. `supabase/migrations/004_community.sql`
5. `supabase/migrations/005_contact_submissions.sql`

---

## Step 4: Seed Resources

After migrations complete, seed the resource database.

In the Supabase SQL Editor, run the generated SQL from `src/data/seed-resources.ts`.

To generate the SQL, run locally:
```bash
node -e "const { generateSeedSQL } = require('./src/data/seed-resources.ts'); console.log(generateSeedSQL())"
```

Or manually insert a few resources via the Supabase Table Editor to get started.

---

## Step 5: Deploy the AI Sherpa Edge Function

Set the Anthropic API key as a secret:
```bash
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Deploy the edge function:
```bash
supabase functions deploy ai-sherpa
```

Test it:
```bash
supabase functions invoke ai-sherpa --body '{"message":"What financial resources are available?","conversationId":null,"messages":[],"userContext":{}}'
```

---

## Step 6: Configure Authentication

In Supabase Dashboard > **Authentication > Settings**:

1. **Site URL:** Set to your local dev URL: `http://localhost:8080`
2. **Redirect URLs:** Add `http://localhost:8080/**`
3. **Email confirmations:** Disable for development (enable for production)
4. **JWT Expiry:** Set to `3600` (1 hour)

For production, add your Lovable deployment URL to the allowed URLs.

---

## Step 7: Enable Realtime for Community

In Supabase Dashboard > **Database > Replication**:

Enable replication for `community_messages` table (should already be done by migration 004).

---

## Step 8: Verify Setup

Start the dev server:
```bash
npm run dev
```

Navigate to `http://localhost:8080` and:
- [ ] Landing page loads
- [ ] Can create an account
- [ ] Onboarding flow completes
- [ ] Dashboard shows
- [ ] Resources page loads (will be empty until seeded)
- [ ] Hope AI responds (requires Anthropic API key set)
- [ ] Community channels appear
- [ ] Contact form submits

---

## Production Deployment (Lovable)

1. Push this repo to GitHub
2. Go to [lovable.dev](https://lovable.dev)
3. Import your GitHub repository
4. Set environment variables in Lovable:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Lovable will build and deploy automatically

Update Supabase Auth > Site URL to your Lovable deployment URL.

---

## Troubleshooting

### "Missing Supabase environment variables"
→ Create `.env.local` with your project URL and anon key

### "No resources showing"
→ Run the seed SQL in your Supabase SQL Editor

### "Hope AI not responding"
→ Check that `ANTHROPIC_API_KEY` is set: `supabase secrets list`

### RLS errors in console
→ Make sure you're authenticated — protected routes require login

### Realtime not working in community
→ Check Supabase Dashboard > Database > Replication — `community_messages` must be in the publication
