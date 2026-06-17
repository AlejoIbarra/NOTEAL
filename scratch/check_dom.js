const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'src', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const ids = [
  'projects-list',
  'global-notes-list',
  'empty-state',
  'active-note-header',
  'editor-split-panel',
  'markdown-editor',
  'markdown-preview-container',
  'active-note-title-input',
  'pane-editor',
  'pane-preview',
  'btn-new-project',
  'btn-new-global-note',
  'btn-save-note',
  'btn-export-note',
  'btn-pin-note',
  'btn-view-toggle',
  'view-toggle-icon',
  'lock-screen-overlay',
  'lock-password-input',
  'lock-error-message',
  'btn-unlock-vault',
  'setup-wizard-overlay',
  'wizard-engine',
  'wizard-online-fields',
  'wizard-online-url',
  'wizard-online-token',
  'wizard-encrypt-checkbox',
  'wizard-crypto-fields',
  'wizard-password',
  'wizard-password-confirm',
  'wizard-custom-path',
  'btn-wizard-select-path',
  'btn-wizard-submit',
  'btn-settings-trigger',
  'settings-modal-overlay',
  'btn-close-settings',
  'btn-cancel-settings',
  'btn-save-settings',
  'settings-engine',
  'online-db-fields',
  'settings-online-url',
  'settings-online-token',
  'settings-custom-path',
  'btn-settings-select-path',
  'settings-encrypt-checkbox',
  'crypto-fields',
  'settings-password',
  'settings-password-confirm',
  'search-input',
  'tab-notes',
  'tab-tasks',
  'workspace-container',
  'tasks-workspace-container',
  'btn-new-task-trigger',
  'tasks-filter-project',
  'btn-add-status',
  'tasks-columns-container',
  'pinned-task-widget',
  'pinned-task-title',
  'pinned-task-project',
  'btn-unpin-task',
  'btn-complete-pinned-task',
  'task-modal-overlay',
  'btn-close-task-modal',
  'btn-cancel-task-modal',
  'btn-save-task-modal',
  'task-modal-title',
  'task-modal-desc',
  'task-modal-desc-preview',
  'task-modal-project',
  'task-modal-priority',
  'task-modal-status'
];

console.log('Verificando IDs de elementos DOM...');
let missingCount = 0;
ids.forEach(id => {
  const pattern = new RegExp(`id=["']${id}["']`, 'i');
  if (!pattern.test(html)) {
    console.error(`[-] ID FALTANTE: "${id}" no se encontró en index.html`);
    missingCount++;
  } else {
    // console.log(`[+] Encontrado: "${id}"`);
  }
});

if (missingCount === 0) {
  console.log('[OK] Todos los IDs están presentes en index.html');
} else {
  console.error(`[ERROR] Se encontraron ${missingCount} IDs faltantes en index.html`);
}
