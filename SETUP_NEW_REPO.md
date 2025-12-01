# Setting Up New Git Repository

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `Bella-NEW`
3. Choose Private or Public
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

## Step 2: Connect and Push

Once you have the repository URL, run these commands:

```bash
# Add the new remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Bella-NEW.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/Bella-NEW.git

# Push to the new repository
git branch -M main
git push -u origin main
```

## Alternative: If you want to use a different branch name

If you prefer to keep "master" as the branch name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/Bella-NEW.git
git push -u origin master
```

