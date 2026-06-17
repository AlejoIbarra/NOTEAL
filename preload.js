const { contextBridge, ipcRenderer } = require('electron');
const CryptoJS = require('crypto-js');
const { marked } = require('marked');

// Configuración personalizada de marked para soportar saltos de línea y tablas más cómodas
marked.setOptions({
  gfm: true,
  breaks: true
});

contextBridge.exposeInMainWorld('notealAPI', {
  // Canales IPC de archivos
  saveLocalFile: (filename, data, customDir) => ipcRenderer.invoke('save-local-file', { filename, data, customDir }),
  readLocalFile: (filename, customDir) => ipcRenderer.invoke('read-local-file', { filename, customDir }),
  exportMarkdown: (filename, content) => ipcRenderer.invoke('export-markdown', { filename, content }),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  popoutNote: (note) => ipcRenderer.invoke('popout-note', note),
  toggleAlwaysOnTop: (alwaysOnTop) => ipcRenderer.invoke('toggle-always-on-top', alwaysOnTop),
  postgresTestConnection: (config) => ipcRenderer.invoke('postgres-test-connection', config),
  postgresLoadData: (config) => ipcRenderer.invoke('postgres-load-data', config),
  postgresSaveData: (config, data) => ipcRenderer.invoke('postgres-save-data', { config, data }),
  updateNote: (note) => ipcRenderer.send('update-note', note),
  onNoteUpdated: (callback) => ipcRenderer.on('note-updated-broadcast', (event, note) => callback(note)),
  updateTask: (task) => ipcRenderer.send('update-task', task),
  onTaskUpdated: (callback) => ipcRenderer.on('task-updated-broadcast', (event, task) => callback(task)),
  
  // Utilidades Criptográficas (Cifrado AES de notas y Hashing SHA256)
  encryptText: (text, key) => {
    return CryptoJS.AES.encrypt(text, key).toString();
  },
  decryptText: (cipherText, key) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return '';
    }
  },
  hashSHA256: (text) => {
    return CryptoJS.SHA256(text).toString();
  },
  
  // Renderizador de Markdown tipo GitHub
  parseMarkdown: (markdown) => {
    return marked.parse(markdown);
  }
});
