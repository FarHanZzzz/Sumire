# Anime News Website

## Overview
This project is an Anime News website that fetches real-time anime news from various sources and displays it in a user-friendly interface. The website features a warm color tone with a bluish vibe, providing a modern 3D UI experience.

## Features
- Fetches real-time anime news articles.
- Displays detailed information about selected anime, including summaries and images.
- Allows users to manage a watch list, enabling them to add or delete anime titles.

## Project Structure
```
anime-news
├── src
│   ├── assets
│   │   └── styles
│   │       ├── main.css
│   │       └── components.css
│   ├── components
│   │   ├── NewsCard.js
│   │   ├── AnimeDetails.js
│   │   └── WatchList.js
│   ├── services
│   │   ├── newsApi.js
│   │   └── watchlistService.js
│   ├── utils
│   │   └── helpers.js
│   ├── index.html
│   └── app.js
├── public
│   └── index.html
├── package.json
└── README.md
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd anime-news
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Start the application:
   ```
   npm start
   ```

## Usage
- Visit the homepage to view the latest anime news.
- Click on any news article to view more details.
- Manage your watch list by adding or removing titles as desired.

## License
This project is licensed under the ISC License.