# EZVTOP Backend Deployment Guide

You can deploy the backend to Deno Deploy using two methods:
1. **GitHub Integration (Recommended)**: Automatically redeploys every time you push to GitHub.
2. **Deno Deploy CLI (deployctl)**: Deploy directly from your Command Prompt.

---

## Method 1: GitHub Integration (Recommended)

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new) in your web browser.
2. Name your repository (e.g., `ezvtop-backend`).
3. Choose **Private** (or Public) and click **Create repository**.
4. Copy your repository's URL (e.g., `https://github.com/YOUR_USERNAME/ezvtop-backend.git`).

### Step 2: Push Your Code to GitHub
Open your Command Prompt (CMD) in the project root directory (`UniCC-main`) and run:

```cmd
# Initialize Git repository
git init

# Add all files to staging (uses the existing .gitignore)
git add .

# Create the initial commit
git commit -m "Migrate to database-free in-memory backend"

# Set branch name to main
git branch -M main

# Link to your new GitHub repository (replace with your copied URL)
git remote add origin https://github.com/YOUR_USERNAME/ezvtop-backend.git

# Push the code to GitHub
git push -u origin main
```

### Step 3: Link to Deno Deploy
1. Go to [dash.deno.com](https://dash.deno.com/) and log in.
2. Click **New Project**.
3. Choose **Connect to GitHub**.
4. Select your repository (`ezvtop-backend`) and branch (`main`).
5. Set the entrypoint to:
   ```
   backend/src/deno_server.ts
   ```
6. Click **Link** or **Deploy**! Deno Deploy will now automatically build and host your server.

---

## Method 2: Deno Deploy CLI (`deployctl`)

If you prefer to deploy directly from your Command Prompt without Git:

1. **Install Deno** (if not installed):
   ```cmd
   winget install Deno.Deno
   ```

2. **Install Deno Deploy CLI**:
   ```cmd
   deno install --global --name=deployctl jsr:@deno/deployctl
   ```

3. **Authenticate**:
   ```cmd
   deployctl signin
   ```

4. **Deploy**:
   ```cmd
   deployctl deploy --project=ezvtop-backend --entrypoint=backend/src/deno_server.ts
   ```
