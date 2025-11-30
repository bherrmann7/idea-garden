# 🌱 Idea Garden

A simple, configurable project tracker. Built with Vite, served by nginx with WebDAV - no backend server required.

## Features

- Create, edit, and delete project ideas
- Auto-save (500ms debounce)
- Drag-and-drop reordering
- Responsive multi-column layout
- Synced across all devices
- Configurable branding for multiple deployments

## Development

```bash
npm install
npm run dev
```

Dev server runs on http://localhost:5173.

## Deployment

The app is configured via environment files stored in your home directory (not in the repo).

### 1. Create a config file

```bash
# ~/.my-app.env
VITE_API_PATH="/secret-abc123/data"
VITE_APP_TITLE="My Project Tracker"
VITE_APP_HEADING="📋 My Project Tracker"
VITE_ADD_BUTTON="Add Project"
VITE_PLACEHOLDER="Add a new project..."
VITE_EMPTY_MESSAGE="No projects yet. Add your first project above!"
VITE_BASE="/myapp/"
DEPLOY_TARGET="user@server:/path/to/deploy/"
```

### 2. Add to build-deploy.sh

Add a case for your app in `build-deploy.sh`:

```bash
my-app)
    CONFIG_FILE=~/.my-app.env
    ;;
```

### 3. Deploy

```bash
./build-deploy.sh my-app
```

## Architecture

**No backend server required!** nginx handles everything:

- **Frontend**: Static files served by nginx
- **API**: nginx WebDAV reads/writes `projects.json`

See [nginx/README.md](nginx/README.md) for server setup instructions.

## Example: Multiple Deployments

You can deploy multiple instances with different branding:

| App | Title | Config File |
|-----|-------|-------------|
| idea-garden | 🌱 Idea Garden | `~/.idea-garden.env` |
| home-todo | 🏠 Home To Do | `~/.home-todo.env` |

```bash
./build-deploy.sh idea-garden
./build-deploy.sh home-todo
```

Each deployment has its own secret API path and data file.

## License

MIT
