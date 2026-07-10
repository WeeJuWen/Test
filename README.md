# Hua Yan Amitabha Pure Land Learning Centre Website

A bilingual (English/Chinese) website for the Hua Yan Amitabha Pure Land Learning Centre, featuring event management, live streaming, and program information.

## Features

- **Bilingual Support**: Toggle between English and Chinese languages
- **Event Management**: Admin panel to create, edit, and delete events with PDF attachments
- **Live Streaming**: YouTube integration for live Dharma talks and ceremonies
- **Program Information**: Display of various Buddhist programs and activities
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Local Storage**: Data persistence using browser localStorage

## Technology Stack

- **Frontend**: HTML5, JavaScript (ES6+)
- **Styling**: Tailwind CSS (via CDN)
- **Fonts**: Noto Serif SC (Chinese), Inter (English)
- **Icons**: SVG icons
- **Storage**: Browser localStorage

## Project Structure

```
Explore/
├── admin.html              # Admin panel for event and stream management
├── events.html             # Events listing page
├── index.html              # Homepage
├── livestream.html         # Live stream page
├── programs.html           # Programs and activities page
├── assets/
│   ├── images/             # Logo and event posters
│   ├── scripts/
│   │   ├── admin-script.js # Admin panel functionality
│   │   ├── languages.js    # Translation management
│   │   └── script.js       # Main site functionality
│   └── styles/
│       └── styles.css      # Custom styles
└── README.md
```

### Admin Panel
Access the admin panel at `admin.html` to:
- Add new events with date, time, location, and description
- Upload PDF attachments for event details
- Enable/disable live streaming
- Configure YouTube video ID for live streams
- Edit or delete existing events

### Language Toggle
Click the "EN/中文" button in the navigation to switch between English and Chinese.

## Features Detail

### Event Management
- Events are automatically filtered to show only upcoming events
- Past events are auto-deleted from localStorage
- PDF files can be attached to events for additional details
- Events are sorted by proximity to current date

### Live Streaming
- YouTube video integration for live streams
- Mobile-friendly iframe embedding
- Desktop YouTube API integration for advanced features
- Error handling for invalid video IDs

### Responsive Design
- Mobile menu with hamburger icon
- Responsive grid layouts for events and programs
- Touch-friendly interface
- Optimized for various screen sizes

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Data Storage

All data (events, live stream config, language preference) is stored in browser localStorage. Note that:
- Data is local to the browser and device
- Clearing browser data will remove all stored information
- For production use, consider implementing a backend database
