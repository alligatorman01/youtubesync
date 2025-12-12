# YouTube View Sync - Webhook Setup

## Railway Deployment Instructions

### 1. Deploy to Railway

1. Push your code to a GitHub repository
2. Go to [Railway](https://railway.app/) and sign in
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository

### 2. Configure Environment Variables

In Railway, add these environment variables:

```
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_database_id
YOUTUBE_TOKEN=your_youtube_api_key_or_refresh_token
GOOGLE_CLIENT_ID=your_google_client_id (if using OAuth)
GOOGLE_CLIENT_SECRET=your_google_client_secret (if using OAuth)
```

### 3. Get Your Webhook URL

After deployment, Railway will provide a public URL like:
`https://your-app-name.up.railway.app`

Your webhook endpoint will be:
`https://your-app-name.up.railway.app/webhook`

### 4. Configure Notion Webhook Button

Notion now supports native webhooks! Here's how to set up a button:

1. **Add a Button to Your Notion Page:**
   - Type `/button` in your Notion page
   - Or click `+` and select "Button"

2. **Configure the Button:**
   - Give it a name like "🔄 Sync YouTube Views"
   - Click "Add action"
   - Select **"Send webhook"**

3. **Enter Your Webhook URL:**
   - URL: `https://your-app-name.up.railway.app/webhook`
   - (Optional) Add custom headers if needed
   - Key: `Authorization`
   - Value: `Bearer your-secret-token` (if you want to add security)

4. **Save and Test:**
   - Click the button to trigger the sync!

### 5. Optional: Database Automation

You can also set up automatic syncing using database automations:

1. Go to your Notion database
2. Click `•••` → "Automations"
3. Create a new automation:
   - **Trigger:** Choose your trigger (e.g., "When property edited", "On schedule")
   - **Action:** Select "Send webhook"
   - **URL:** `https://your-app-name.up.railway.app/webhook`

This allows automatic syncing without manual button clicks!

### 6. Test Your Setup

Visit your Railway app URL:
- Health check: `https://your-app-name.up.railway.app/`
- Manual trigger: `https://your-app-name.up.railway.app/trigger`

## Local Testing

Run locally:
```bash
npm start
```

Test webhook:
```bash
curl -X POST http://localhost:3000/webhook
```

## Commands

- `npm start` - Start the webhook server
- `npm run dev` - Start in development mode
- `npm run sync` - Run sync manually (one-time)
