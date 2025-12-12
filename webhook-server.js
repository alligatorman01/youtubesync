require('dotenv').config();
const express = require('express');
const { updateNotionWithYouTubeData } = require('./index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint (useful for Railway)
app.get('/', (req, res) => {
  res.json({ 
    status: 'YouTube-View-Sync server is running',
    message: 'Send POST request to /webhook to trigger sync'
  });
});

// Webhook endpoint for Notion button
app.post('/webhook', async (req, res) => {
  console.log('Webhook received from Notion');
  console.log('Request body:', req.body);
  
  try {
    // Send immediate response to Notion
    res.status(200).json({ 
      message: 'Sync triggered successfully',
      timestamp: new Date().toISOString()
    });
    
    // Run the sync in the background
    console.log('Starting YouTube view count sync...');
    await updateNotionWithYouTubeData();
    console.log('Sync completed successfully!');
  } catch (error) {
    console.error('Error during sync:', error);
    // Note: Response already sent, so we just log the error
  }
});

// Optional: Manual trigger endpoint (useful for testing)
app.get('/trigger', async (req, res) => {
  console.log('Manual trigger received');
  
  try {
    res.status(200).json({ 
      message: 'Sync started',
      timestamp: new Date().toISOString()
    });
    
    await updateNotionWithYouTubeData();
    console.log('Manual sync completed successfully!');
  } catch (error) {
    console.error('Error during manual sync:', error);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  
  // Check if running on Railway or locally
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PUBLIC_DOMAIN;
  const publicDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  
  if (isRailway && publicDomain) {
    console.log(`📍 Webhook endpoint: https://${publicDomain}/webhook`);
    console.log(`🔧 Manual trigger: https://${publicDomain}/trigger`);
  } else {
    console.log(`📍 Webhook endpoint: http://localhost:${PORT}/webhook`);
    console.log(`🔧 Manual trigger: http://localhost:${PORT}/trigger`);
  }
});
