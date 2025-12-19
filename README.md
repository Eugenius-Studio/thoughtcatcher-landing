# ThoughtCatcher Landing Page

Landing page for ThoughtCatcher - Voice-first thought capture for Notion.

**Live Site**: https://eugenius-studio.github.io/thoughtcatcher-landing/

## Overview

This repository contains the marketing landing page for ThoughtCatcher. The landing page is built with vanilla HTML/CSS/JavaScript and deployed via GitHub Pages.

## Features

- Voice-first messaging for ADHD-friendly thought capture
- Founder Deal section (lifetime access offer)
- Early Access signup forms
- Team/B2B waitlist
- Responsive design

## Setup

### Local Development

Simply open `index.html` in your browser. No build process needed.

### Email Collection Setup

The landing page uses Google Apps Script to save form submissions to Google Sheets. Follow the guide in `GOOGLE_FORMS_SETUP.md` to set up the backend.

**Quick Steps**:
1. Create a Google Sheet with two tabs: "Early Access" and "Team Waitlist"
2. Set up Google Apps Script (copy from setup guide)
3. Update the two `GOOGLE_SCRIPT_URL` variables in `index.html`

### Deploy to GitHub Pages

1. Go to **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** → **/ (root)**
4. Click **Save**
5. Site will be live at: `https://YOUR_USERNAME.github.io/thoughtcatcher-landing/`

## Repository Structure

```
.
├── index.html                  # Main landing page
├── GOOGLE_FORMS_SETUP.md      # Email collection setup guide
└── README.md                  # This file
```

## Updating

To update the landing page:

```bash
# Edit index.html
git add index.html
git commit -m "Update landing page"
git push
```

GitHub Pages will automatically rebuild (takes 1-2 minutes).

## Current Status

✅ Design complete
✅ Static founder counter (98 remaining)
✅ Forms ready for Google Sheets integration
⏳ Need to connect Google Apps Script URL (see GOOGLE_FORMS_SETUP.md)

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6)
- **Hosting**: GitHub Pages
- **Email Collection**: Google Apps Script → Google Sheets
- **Font**: Inter (Google Fonts)
- **Colors**: Burnt Orange (#EA580C) to Golden Amber (#F59E0B)

## License

Proprietary - All rights reserved
