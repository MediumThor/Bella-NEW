# Git Authentication Setup for GitHub

The repository is set up locally, but you need to authenticate with GitHub to push the code.

## Option 1: Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name like "Bella-NEW Project"
   - Select scopes: Check `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Push using the token:**
   ```bash
   git push -u origin main
   ```
   When prompted:
   - Username: `MediumThor`
   - Password: **Paste your Personal Access Token** (not your GitHub password)

## Option 2: GitHub CLI (Alternative)

If you have GitHub CLI installed:
```bash
gh auth login
```
Then follow the prompts to authenticate.

## Option 3: Configure Credential Helper (macOS)

For macOS, you can use the keychain:
```bash
git config --global credential.helper osxkeychain
```

Then when you push, enter your username and Personal Access Token, and it will be saved.

## After Authentication

Once authenticated, run:
```bash
git push -u origin main
```

Your code will be pushed to: https://github.com/MediumThor/Bella-NEW

