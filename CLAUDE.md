---
Part of: [[../../HOME]] · [[../../memory/CLAUDE]]
Tags: #project #electron #coding
---

# CLAUDE.md — Classroom Randomizer

## What this project does
A Windows desktop app (Electron) that randomizes student assignments to cleanup tasks.
Uses a template system: each template links a name set, tasks, scheduled days, and vacation blocks.
Generates a full-year schedule with fair rotation tracking.

## File structure
- `main.js` — Electron main process, IPC handlers, JSON file I/O
- `preload.js` — contextBridge, exposes `window.api` to renderer
- `renderer/index.html` — app shell, loads all scripts
- `renderer/app.js` — screen router
- `renderer/lib/utils.js` — pure date/ID helpers (also used by Jest)
- `renderer/lib/rotation.js` — fair rotation logic (also used by Jest)
- `renderer/lib/scheduler.js` — schedule generation (also used by Jest)
- `renderer/lib/data.js` — load/save JSON via window.api
- `renderer/screens/` — one file per screen
- `tests/` — Jest unit tests for lib files

## Data location
`%APPDATA%/classroom-randomizer/` — name-sets.json, templates.json, history.json

## Rules
- Never run git commands without asking Rein first
- Never delete files without confirming
- Run `npm test` after any change to renderer/lib/ files
- Run `npm start` to test the app manually
- Logic goes in renderer/lib/, not in screens/

## Stack
Electron 33, vanilla JS, Jest 29, electron-builder

---
Related: [[../../HOME]] · [[README]]
