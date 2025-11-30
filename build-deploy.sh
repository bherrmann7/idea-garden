#!/bin/bash
set -e
cd "$(dirname "$0")"

APP=${1:-idea-garden}

case $APP in
    idea-garden|ig)
        CONFIG_FILE=~/.idea-garden.env
        ;;
    home-todo|htd)
        CONFIG_FILE=~/.home-todo.env
        ;;
    *)
        echo "Usage: $0 [idea-garden|home-todo]"
        exit 1
        ;;
esac

CONFIG_FILE="${CONFIG_FILE/#\~/$HOME}"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Config file not found: $CONFIG_FILE"
    exit 1
fi

# Read config - export all variables
set -a
source "$CONFIG_FILE"
set +a

echo "Building $APP..."
echo "  API Path: $VITE_API_PATH"
echo "  Base: $VITE_BASE"
echo "  Deploy to: $DEPLOY_TARGET"

# Update vite.config.js base path
sed -i.bak "s|base: '.*'|base: '$VITE_BASE'|" vite.config.js

npx vite build

# Restore vite.config.js
mv vite.config.js.bak vite.config.js

scp -r dist/* "$DEPLOY_TARGET"

echo "Deployed $APP successfully"
