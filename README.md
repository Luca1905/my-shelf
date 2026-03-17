# My Shelf

My Shelf is a personal cloud file-storage and document-management web application. It lets you upload, organise, and manage files from anywhere through a clean, folder-based interface backed by a distributed SQL database. Authentication is handled entirely by Clerk, so your files are always private to you.

## Features

* Secure file upload – up to 15 files at a time, 32 MB each, hosted via Uploadthing.
* Full folder hierarchy with breadcrumb navigation.
* Rename files and folders in place.
* Trash system – move items to trash, restore them, or delete permanently.
* Empty trash in one click.
* Dark mode enabled by default.
* Deployed on Netlify with a GitHub Actions CI pipeline.

## Planned

* File preview
* File search
* Drag-and-drop upload
* Shared documents
* Multi-row selection
* File download
* Progress bar on upload button

## Installation

### Prerequisites

* [Node.js](https://nodejs.org/) ≥ 18
* [pnpm](https://pnpm.io/) ≥ 9
* A [SingleStore](https://www.singlestore.com/) database instance
* A [Clerk](https://clerk.com/) application (for authentication)
* An [Uploadthing](https://uploadthing.com/) project (for file storage)

### 1. Clone and install dependencies

```bash
git clone https://github.com/Luca1905/my-shelf.git
cd my-shelf
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in the required values in `.env`:

```
SINGLESTORE_USER=your_user
SINGLESTORE_PASS=your_password
SINGLESTORE_HOST=your_host.svc.singlestore.com
SINGLESTORE_PORT=3333
SINGLESTORE_DB_NAME=your_database
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
```

### 3. Initialise the database

```bash
pnpm db:push
```

### 4. Start the development server

```bash
pnpm dev
```

The application is now available at `http://localhost:3000`.

## Usage

1. Open the application and sign in with your Clerk account.
2. On first login, My Shelf automatically creates your root folder structure.
3. Use the **Upload** button to add files to the current folder.
4. Click **New Folder** to create a sub-folder.
5. Right-click (or use the row actions menu) on any file or folder to rename or delete it.
6. Deleted items are moved to the **Trash** folder; restore or permanently remove them from the Trash page.

## Development

```bash
# Start dev server with Turbo
pnpm dev

# Lint and type-check
pnpm check

# Auto-fix lint issues
pnpm lint:fix

# Format code
pnpm format:write

# Open Drizzle Studio (visual database manager)
pnpm db:studio
```

## Testing

There is currently no automated test suite. Code quality is enforced through ESLint and TypeScript:

```bash
pnpm lint       # ESLint
pnpm typecheck  # TypeScript – tsc --noEmit
pnpm check      # Both of the above
```

These checks also run automatically on every push via GitHub Actions.

## Project Structure

```
.
├── src/
│   ├── app/                  # Next.js App Router (routes & pages)
│   │   ├── (home)/           # Landing, shelf home, and sign-in pages
│   │   ├── f/[folderId]/     # Dynamic folder viewer and trash page
│   │   ├── api/uploadthing/  # Uploadthing API route handler
│   │   └── _providers/       # PostHog analytics providers
│   ├── server/
│   │   ├── actions.ts        # Server actions (delete, rename, restore, …)
│   │   └── db/               # Drizzle schema, queries, and DB connection
│   ├── components/           # Reusable UI and UX components (shadcn/ui)
│   ├── lib/                  # Utility helpers (formatFileSize, cn, …)
│   └── middleware.ts         # Clerk authentication middleware
├── public/                   # Static assets
├── drizzle.config.ts         # Drizzle ORM configuration
├── next.config.js            # Next.js configuration
├── netlify.toml              # Netlify deployment configuration
└── .env.example              # Example environment variables
```

## License

My Shelf does not currently ship with an explicit open-source license. All rights are reserved by the author unless stated otherwise.