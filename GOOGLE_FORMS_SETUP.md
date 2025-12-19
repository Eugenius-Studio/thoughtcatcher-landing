# Google Forms Setup Guide for ThoughtCatcher Landing Page

## Overview
Your landing page is now configured to use Google Sheets via Google Apps Script for email collection. This guide will help you set up the backend.

## What's Changed
- ✅ Founder counter is now static (showing 98 remaining)
- ✅ Forms are ready for Google Sheets integration
- ⏳ Need to create Google Apps Script endpoint (see below)

---

## Step-by-Step Setup (30 minutes)

### Step 1: Create Google Sheet

1. Go to https://sheets.google.com
2. Create a new spreadsheet called "ThoughtCatcher Signups"
3. Create two sheets (tabs):
   - **Sheet 1**: "Early Access" with columns:
     - `Timestamp | Name | Email | Tier | Use Case | Beta Access`
   - **Sheet 2**: "Team Waitlist" with columns:
     - `Timestamp | Name | Email | Company | Team Size | Interest | Early Access`

### Step 2: Create Google Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any code in the editor
3. Paste this code:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);

    // Determine which sheet to use based on source
    var targetSheet;
    if (data.source === 'early_access_modal') {
      targetSheet = sheet.getSheetByName('Early Access');
      targetSheet.appendRow([
        data.timestamp,
        data.name,
        data.email,
        data.tier,
        data.useCase,
        data.betaAccess
      ]);
    } else {
      // Team waitlist
      targetSheet = sheet.getSheetByName('Team Waitlist');
      targetSheet.appendRow([
        data.timestamp,
        data.name,
        data.email,
        data.company,
        data.teamSize,
        data.interest,
        data.earlyAccess
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (disk icon)
5. Click **Deploy → New deployment**
6. Click gear icon ⚙️ next to "Select type" → Choose **Web app**
7. Configure:
   - **Description**: ThoughtCatcher Signup Handler
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
8. Click **Deploy**
9. **IMPORTANT**: Copy the Web app URL (looks like: `https://script.google.com/macros/s/.../exec`)

### Step 3: Update Landing Page

1. Open `docs/index.html`
2. Find this line (appears twice):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace with your actual URL from Step 2:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec';
   ```

### Step 4: Test

1. Save and commit the changes:
   ```bash
   git add docs/index.html
   git commit -m "Connect Google Sheets for email collection"
   git push
   ```

2. Wait 1-2 minutes for GitHub Pages to update

3. Visit your landing page and test:
   - Click "Get Started" button
   - Fill out the form
   - Submit
   - Check your Google Sheet to see if data appeared

---

## Troubleshooting

### Forms not submitting?
- Check browser console (F12) for errors
- Make sure you deployed the script as "Anyone" can access
- Verify the script URL is correct (should end with `/exec`)

### Data not appearing in sheet?
- Check the script execution logs: Apps Script → Executions
- Make sure sheet names match exactly ("Early Access", "Team Waitlist")
- Check column headers match the script

### CORS errors?
- This is expected! The `mode: 'no-cors'` setting handles this
- Forms will still work even with CORS warnings in console

---

## Alternative: Use Formspree Instead (5 minutes)

If Google Apps Script is too complex, use Formspree instead:

1. Go to https://formspree.io and sign up (free)
2. Create two forms:
   - "ThoughtCatcher Early Access"
   - "ThoughtCatcher Team Waitlist"
3. Get the form endpoint URLs
4. Replace in `docs/index.html`:
   ```javascript
   // For early access form:
   const GOOGLE_SCRIPT_URL = 'https://formspree.io/f/YOUR_FORM_ID';

   // For waitlist form:
   const GOOGLE_SCRIPT_URL = 'https://formspree.io/f/YOUR_OTHER_FORM_ID';
   ```
5. Remove the `mode: 'no-cors'` line (not needed for Formspree)

---

## What Happens After Setup

✅ When users fill out forms, data goes directly to your Google Sheet
✅ Founder counter shows "98 remaining" (static)
✅ No backend server needed
✅ Forms work immediately
✅ You can export to CSV, connect to email marketing tools, etc.

---

## Need Help?

Check these resources:
- Full tutorial: https://github.com/jamiewilson/form-to-google-sheets
- Google Apps Script docs: https://developers.google.com/apps-script
- Formspree docs: https://help.formspree.io
