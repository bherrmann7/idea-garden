# 🌱 Idea Garden

A place to plant and cultivate your project ideas. Built with Vite, served by nginx with WebDAV.

## Project Structure

```
idea-garden/
├── index.html
├── main.js
├── styles.css
├── vite.config.js
├── package.json
└── nginx/             # Server config & docs
    ├── README.md      # Setup instructions
    └── nginx-ig.conf  # nginx location blocks
```

## Development

```bash
npm install
npm run dev
```

Dev server runs on http://localhost:5173.

## Deployment

```bash
# Build and deploy to jadn.com
npm run deploy
```

This builds the frontend and copies files to `root@wilddog.local:/mnt/studio/jadn/ROOT/ig/`.

**Live at:** https://jadn.com/ig/

## Architecture

**No backend server required!** nginx handles everything:

- **Frontend**: Static files served from `/mnt/studio/jadn/ROOT/ig/`
- **API**: nginx WebDAV reads/writes `projects.json`

See [nginx/README.md](nginx/README.md) for server setup instructions.

## Features

- Create, edit, and delete project ideas
- Auto-save (500ms debounce)
- Drag-and-drop reordering
- Responsive multi-column layout
- Synced across all devices

## License

MIT
