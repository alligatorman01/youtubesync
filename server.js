require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');

async function main() {
  const { default: open } = await import('open');
  const app = express();
  const port = 3000;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly'
  ];

  app.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });

    console.log('Authorize this app by visiting this url:', url);
    open(url);
    res.send('Authorization initiated. Please check your browser.');
  });

  app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
      res.send('No code provided');
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      console.log('Your refresh token is:', tokens.refresh_token);
      res.send('Authentication successful! Check your console for the refresh token.');
    } catch (error) {
      console.error('Error retrieving access token', error);
      res.send('Error retrieving access token');
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

main().catch(console.error);
