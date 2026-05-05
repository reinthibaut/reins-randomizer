const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(app.getPath('userData'), 'classroom-randomizer');
const FILES = {
  nameSets: path.join(DATA_DIR, 'name-sets.json'),
  templates: path.join(DATA_DIR, 'templates.json'),
  history: path.join(DATA_DIR, 'history.json'),
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const file of Object.values(FILES)) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf-8');
  }
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('renderer/index.html');
}

app.whenReady().then(() => {
  ensureDataDir();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('read-name-sets', () => readJSON(FILES.nameSets));
ipcMain.handle('write-name-sets', (_, data) => { writeJSON(FILES.nameSets, data); });
ipcMain.handle('read-templates', () => readJSON(FILES.templates));
ipcMain.handle('write-templates', (_, data) => { writeJSON(FILES.templates, data); });
ipcMain.handle('read-history', () => readJSON(FILES.history));
ipcMain.handle('write-history', (_, data) => { writeJSON(FILES.history, data); });
