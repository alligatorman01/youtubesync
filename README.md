# YouTube View Sync

Automatically sync YouTube video view counts, titles, and durations to your Notion database.

## Features

- 🔄 Sync YouTube stats to Notion database
- 🪝 Webhook support for Notion button triggers
- 🚂 Railway-ready deployment
- 📊 Supports both regular YouTube videos and Shorts

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `NOTION_TOKEN` - Your Notion integration token
- `NOTION_DATABASE_ID` - Your Notion database ID
- `YOUTUBE_TOKEN` - Your YouTube API key or refresh token

### 3. Run Locally

```bash
# Start webhook server
npm start

# Run one-time sync
npm run sync
```

## Deployment

See [RAILWAY-SETUP.md](./RAILWAY-SETUP.md) for detailed Railway deployment instructions.

## API Endpoints

- `GET /` - Health check
- `POST /webhook` - Webhook endpoint for Notion
- `GET /trigger` - Manual sync trigger

## License

MIT
