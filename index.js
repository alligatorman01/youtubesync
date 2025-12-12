const { Client, LogLevel } = require("@notionhq/client");
const { google } = require("googleapis");
const urlModule = require('url');
require('dotenv').config();  // Load environment variables from .env file

// Initializing a Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  logLevel: LogLevel.DEBUG,
});

// Initializing a YouTube client
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_TOKEN,
});

// The ID of the database where video data is stored
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function getAllPagesFromDatabase(databaseId) {
  let allPages = [];
  let hasNextPage = null;
  let startCursor = undefined;

  const filter = {
    "or": [
      {
        "property": "Project ID",
        "multi_select": {
          "contains": "YouTube Shorts"
        }
      },
      {
        "property": "Project ID",
        "multi_select": {
          "contains": "YouTube"
        }
      }
    ]
  };

  do {
    let response = await notion.databases.query({
      database_id: databaseId,
      filter: filter,
      start_cursor: startCursor,
    });

    allPages = allPages.concat(response.results);
    hasNextPage = response.has_more;
    startCursor = response.next_cursor;

  } while (hasNextPage);

  return allPages;
}

function convertISO8601ToMinutesAndSeconds(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = (parseInt(match[1]) || 0);
  const minutes = (parseInt(match[2]) || 0) + hours * 60;
  const seconds = parseInt(match[3]) || 0;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function updateNotionWithYouTubeData() {
  const pages = await getAllPagesFromDatabase(DATABASE_ID);

  for (const page of pages) {
    const url = page.properties["Deliverable Link"]?.url;
    if (!url) {
      console.warn(`Skipping page ${page.id} because it doesn't have a 'Deliverable Link' property or the property doesn't contain a URL.`);
      continue;
    }

    const parsedUrl = urlModule.parse(url, true);
    let videoId = null;
    if (parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') {
      if (parsedUrl.query.v) {
        videoId = parsedUrl.query.v;
      } else if (parsedUrl.pathname.includes('/shorts/')) {
        videoId = parsedUrl.pathname.split('/shorts/')[1];
      }
    }

    if (!videoId) {
      console.warn(`Skipping page ${page.id} because it's not a valid YouTube video URL.`);
      continue;
    }

    const response = await youtube.videos.list({
      part: "snippet,statistics,contentDetails",
      id: videoId,
    });

    console.log(`YouTube API response for video ${videoId}:`, response.data);

    const video = response.data.items[0];
    if (!video) {
      console.error(`Unable to retrieve video data for video ID ${videoId}`);
      continue;
    }

    const viewCount = parseInt(video.statistics.viewCount);
    const videoTitle = video.snippet.title;
    const videoDuration = convertISO8601ToMinutesAndSeconds(video.contentDetails.duration);

    console.log(`Video ${videoId} has ${viewCount} views.`);
    
    const updatedPage = await notion.pages.update({
        page_id: page.id,
        properties: {
            "View Count": {
                number: viewCount,
            },
            "Video Title": {
                rich_text: [
                    {
                        text: {
                            content: videoTitle,
                        },
                    },
                ],
            },
            "Video Duration": {
                rich_text: [
                    {
                        text: {
                            content: videoDuration,
                        },
                    },
                ],
            },
        },
    });
    

    console.log(`Updated page ${page.id} with view count: ${updatedPage.properties["View Count"].number}`);
  }
}

// Export the function for use in other files
module.exports = { updateNotionWithYouTubeData };

// Run the function only if this file is run directly (not imported)
if (require.main === module) {
  updateNotionWithYouTubeData().catch(console.error);
}
