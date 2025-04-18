# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ba9ece32-5a10-4138-98ae-a31d9f80464a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ba9ece32-5a10-4138-98ae-a31d9f80464a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ba9ece32-5a10-4138-98ae-a31d9f80464a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Her Health Tracker Application

A comprehensive health tracker application for women, focusing on period and pregnancy tracking.

## Local Storage Persistence

This application relies on localStorage to maintain tracking data between sessions. The following mechanisms have been implemented to ensure data is not lost between sessions:

### Storage Utilities

- The application uses a custom storage utility (`storage-utils.ts`) to safely interact with localStorage
- All data is backed up regularly to prevent data loss
- The app checks for data loss on startup and restores from backups if needed

### Firebase Authentication Persistence

- Firebase authentication is configured to use `browserLocalPersistence`
- User data is stored in multiple locations for redundancy:
  - localStorage
  - sessionStorage
  - cookies (where available)

### Preventing Data Loss

The application includes several safeguards against accidental data loss:

1. **Storage Watcher**: Monitors localStorage events and restores data automatically if cleared
2. **Regular Backups**: Creates backups of important data every 30 seconds
3. **Startup Checks**: Verifies data integrity when the application starts

## Running the Application

To run the application locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Important Notes

- **Do Not Use Private/Incognito Mode**: Private browsing modes usually clear localStorage when closing the browser
- **Allow Cookies**: Make sure your browser allows cookies for the site
- **Use Modern Browsers**: The application works best on recent versions of Chrome, Firefox, Safari, or Edge

## Troubleshooting

If your data is still being cleared between sessions:

1. Make sure you are accessing the site using the same URL each time (e.g., always use `http://localhost:8080`)
2. Check if your browser has settings that automatically clear website data
3. Verify that your browser extensions aren't clearing localStorage
4. Try disabling "Clear browsing data on exit" if enabled in your browser

## Data Management

Users can reset their own data through the profile settings, which provides the only intended way to clear specific data types:

- In Pregnancy Profile: Click "Reset Pregnancy Data" 
- In Period Profile: Click "Reset Period Data"

The application is designed to maintain user data between sessions until the user explicitly chooses to reset it.

#   t r a c k e r 
 
 #   t r a c k e r 
 
 