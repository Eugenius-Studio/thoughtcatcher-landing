# GitHub Setup Instructions

## Step 1: Create New Repository on GitHub

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `thoughtcatcher-landing`
   - **Description**: "Landing page for ThoughtCatcher - Voice-first thought capture for Notion"
   - **Visibility**: Public (required for free GitHub Pages)
   - **DO NOT** initialize with README, .gitignore, or license (we already have files)
3. Click **Create repository**

## Step 2: Push Your Code

GitHub will show you instructions. Use the "push an existing repository" section:

```bash
cd /tmp/thoughtcatcher-landing

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/thoughtcatcher-landing.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repo: `https://github.com/YOUR_USERNAME/thoughtcatcher-landing`
2. Click **Settings** (top navigation)
3. Click **Pages** (left sidebar)
4. Under "Source":
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes
7. Your site will be live at: `https://YOUR_USERNAME.github.io/thoughtcatcher-landing/`

## Step 4: Clean Up Old Repo (Optional)

Once the new repo is working, you can optionally remove the landing page from the mobile repo:

```bash
cd /Users/aidaissayeva/taskVoice/taskvoice-mobile

# Remove docs folder (landing page)
git rm -r docs/
git rm GOOGLE_FORMS_SETUP.md
git commit -m "Move landing page to separate repo (thoughtcatcher-landing)"
git push
```

Then disable GitHub Pages on the old repo:
1. Go to https://github.com/Eugenius-Studio/thoughtCatcher-mobile/settings/pages
2. Under "Source", select **None**
3. Click **Save**

## Quick Reference

**Old Landing Page URL** (will be removed):
- https://eugenius-studio.github.io/thoughtCatcher-mobile/

**New Landing Page URL** (after setup):
- https://YOUR_USERNAME.github.io/thoughtcatcher-landing/

**Repos**:
- Mobile App: https://github.com/Eugenius-Studio/thoughtCatcher-mobile
- Landing Page: https://github.com/YOUR_USERNAME/thoughtcatcher-landing (new)

## What's in This Repo

```
/tmp/thoughtcatcher-landing/
├── index.html                # Landing page (with founder counter set to 98)
├── GOOGLE_FORMS_SETUP.md    # Email collection setup guide
├── README.md                # Repository documentation
└── GITHUB_SETUP.md          # This file
```

## Need Help?

If you get stuck, check:
- GitHub Pages docs: https://docs.github.com/en/pages
- Or ask me for help!
