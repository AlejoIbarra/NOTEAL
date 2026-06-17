const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'src', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: false
    },
    // Diseños visuales premium
    backgroundColor: '#0a0f1d',
    titleBarStyle: 'default'
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] ${message} (${sourceId}:${line})`);
  });

  // Descomentar para depuración
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// --- APIs de Comunicación IPC Segura (File System) ---

// Guardar datos en archivo JSON local
ipcMain.handle('save-local-file', async (event, { filename, data, customDir }) => {
  try {
    let folderPath;
    if (customDir && filename !== 'config.json') {
      folderPath = customDir;
    } else {
      const userPath = app.getPath('userData');
      folderPath = path.join(userPath, 'noteal_data');
    }
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(folderPath, filename);
    fs.writeFileSync(filePath, data, 'utf-8');
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error guardando archivo local:', error);
    return { success: false, error: error.message };
  }
});

// Leer datos de archivo JSON local
ipcMain.handle('read-local-file', async (event, { filename, customDir }) => {
  try {
    let folderPath;
    if (customDir && filename !== 'config.json') {
      folderPath = customDir;
    } else {
      const userPath = app.getPath('userData');
      folderPath = path.join(userPath, 'noteal_data');
    }
    const filePath = path.join(folderPath, filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data };
    }
    return { success: true, data: null }; // Archivo no existe aún
  } catch (error) {
    console.error('Error leyendo archivo local:', error);
    return { success: false, error: error.message };
  }
});

// Guardar nota en archivo Markdown individual (.md)
ipcMain.handle('export-markdown', async (event, { filename, content }) => {
  try {
    const desktopPath = app.getPath('desktop');
    const folderPath = path.join(desktopPath, 'NOTEAL_Exports');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(folderPath, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error exportando markdown:', error);
    return { success: false, error: error.message };
  }
});

// Diálogo nativo para seleccionar carpeta
ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return { canceled: true };
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Seleccionar Carpeta de Almacenamiento'
    });
    return result;
  } catch (error) {
    console.error('Error abriendo diálogo de selección:', error);
    return { canceled: true, error: error.message };
  }
});

// Lanzar una ventana flotante (Picture-in-Picture) para una nota
ipcMain.handle('popout-note', async (event, note) => {
  const popoutWindow = new BrowserWindow({
    width: 420,
    height: 350,
    minWidth: 250,
    minHeight: 200,
    frame: false, // Ventana sin bordes para diseño limpio
    alwaysOnTop: true, // Siempre al frente por defecto
    backgroundColor: '#05080c',
    icon: path.join(__dirname, 'src', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: false
    }
  });

  const hashData = encodeURIComponent(JSON.stringify(note));
  popoutWindow.loadFile(path.join(__dirname, 'src', 'popout.html'), { hash: hashData });
  
  popoutWindow.webContents.on('console-message', (e, level, message, line, sourceId) => {
    console.log(`[Popout Console] ${message} (${sourceId}:${line})`);
  });
  
  return { success: true };
});

// Cambiar el estado de "always on top" para la ventana flotante que llama
ipcMain.handle('toggle-always-on-top', async (event, alwaysOnTop) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  if (win) {
    win.setAlwaysOnTop(alwaysOnTop);
    return { success: true, alwaysOnTop };
  }
  return { success: false };
});

// --- APIs de Comunicación Directa con PostgreSQL/Supabase ---

ipcMain.handle('postgres-test-connection', async (event, config) => {
  const client = new Client({
    host: config.host,
    port: parseInt(config.port) || 5432,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    const tableName = config.tableName || 'noteal_vault';
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      throw new Error('Nombre de tabla inválido.');
    }
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(50) PRIMARY KEY,
        data TEXT,
        updated_at TIMESTAMP
      )
    `);
    await client.end();
    return { success: true };
  } catch (error) {
    console.error('Error probando conexión a Postgres:', error);
    try { await client.end(); } catch (e) {}
    return { success: false, error: error.message };
  }
});

ipcMain.handle('postgres-load-data', async (event, config) => {
  const client = new Client({
    host: config.host,
    port: parseInt(config.port) || 5432,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    const tableName = config.tableName || 'noteal_vault';
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      throw new Error('Nombre de tabla inválido.');
    }
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(50) PRIMARY KEY,
        data TEXT,
        updated_at TIMESTAMP
      )
    `);
    
    const res = await client.query(`SELECT data FROM ${tableName} WHERE id = 'single_vault'`);
    await client.end();
    if (res.rows.length > 0) {
      return { success: true, data: res.rows[0].data };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error cargando datos de Postgres:', error);
    try { await client.end(); } catch (e) {}
    return { success: false, error: error.message };
  }
});

ipcMain.handle('postgres-save-data', async (event, { config, data }) => {
  const client = new Client({
    host: config.host,
    port: parseInt(config.port) || 5432,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    const tableName = config.tableName || 'noteal_vault';
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      throw new Error('Nombre de tabla inválido.');
    }
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(50) PRIMARY KEY,
        data TEXT,
        updated_at TIMESTAMP
      )
    `);
    
    await client.query(`
      INSERT INTO ${tableName} (id, data, updated_at) 
      VALUES ('single_vault', $1, NOW()) 
      ON CONFLICT (id) 
      DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
    `, [data]);
    
    await client.end();
    return { success: true };
  } catch (error) {
    console.error('Error guardando datos en Postgres:', error);
    try { await client.end(); } catch (e) {}
    return { success: false, error: error.message };
  }
});

ipcMain.on('update-note', (event, note) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('note-updated-broadcast', note);
  }
});


