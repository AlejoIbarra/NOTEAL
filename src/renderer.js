// NOTEAL: Lógica de la Interfaz (Proceso Renderer)

document.addEventListener('DOMContentLoaded', async () => {
  // --- Estado Global ---
  let appData = {
    projects: [],
    globalNotes: [],
    tasks: []
  };
  
  let activeNote = null; // { id, projectId, title, content }
  let activePassword = ''; // Guardado temporal en memoria para cifrar/descifrar
  let currentLayout = 'split'; // 'split' | 'editor' | 'preview'
  let currentTab = 'notes'; // 'notes' | 'tasks'
  let activeTasksProjectFilter = 'all'; // 'all' | 'none' | projectId

  // --- Elementos del DOM ---
  const projectsList = document.getElementById('projects-list');
  const globalNotesList = document.getElementById('global-notes-list');
  const emptyState = document.getElementById('empty-state');
  
  // Workspace Elements
  const activeNoteHeader = document.getElementById('active-note-header');
  const editorSplitPanel = document.getElementById('editor-split-panel');
  const markdownEditor = document.getElementById('markdown-editor');
  const markdownPreview = document.getElementById('markdown-preview-container');
  const activeNoteTitle = document.getElementById('active-note-title-input');
  const paneEditor = document.getElementById('pane-editor');
  const panePreview = document.getElementById('pane-preview');
  
  // Buttons
  const btnNewProject = document.getElementById('btn-new-project');
  const btnNewGlobalNote = document.getElementById('btn-new-global-note');
  const btnSaveNote = document.getElementById('btn-save-note');
  const btnExportNote = document.getElementById('btn-export-note');
  const btnPinNote = document.getElementById('btn-pin-note');
  const btnViewToggle = document.getElementById('btn-view-toggle');
  const viewToggleIcon = document.getElementById('view-toggle-icon');
  
  // Lock Screen Elements
  const lockScreenOverlay = document.getElementById('lock-screen-overlay');
  const lockPasswordInput = document.getElementById('lock-password-input');
  const lockErrorMessage = document.getElementById('lock-error-message');
  const btnUnlockVault = document.getElementById('btn-unlock-vault');

  // Setup Wizard Elements
  const setupWizardOverlay = document.getElementById('setup-wizard-overlay');
  const wizardEngine = document.getElementById('wizard-engine');
  const wizardOnlineFields = document.getElementById('wizard-online-fields');
  const wizardOnlineUrl = document.getElementById('wizard-online-url');
  const wizardOnlineToken = document.getElementById('wizard-online-token');
  const wizardEncryptCheckbox = document.getElementById('wizard-encrypt-checkbox');
  const wizardCryptoFields = document.getElementById('wizard-crypto-fields');
  const wizardPassword = document.getElementById('wizard-password');
  const wizardPasswordConfirm = document.getElementById('wizard-password-confirm');
  const wizardCustomPath = document.getElementById('wizard-custom-path');
  const btnWizardSelectPath = document.getElementById('btn-wizard-select-path');
  const btnWizardSubmit = document.getElementById('btn-wizard-submit');

  // Settings Elements
  const btnSettingsTrigger = document.getElementById('btn-settings-trigger');
  const settingsModalOverlay = document.getElementById('settings-modal-overlay');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnCancelSettings = document.getElementById('btn-cancel-settings');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  
  const settingsEngine = document.getElementById('settings-engine');
  const onlineDbFields = document.getElementById('online-db-fields');
  const settingsOnlineUrl = document.getElementById('settings-online-url');
  const settingsOnlineToken = document.getElementById('settings-online-token');
  
  const settingsCustomPath = document.getElementById('settings-custom-path');
  const btnSettingsSelectPath = document.getElementById('btn-settings-select-path');
  
  const settingsEncryptCheckbox = document.getElementById('settings-encrypt-checkbox');
  const cryptoFields = document.getElementById('crypto-fields');
  const settingsPassword = document.getElementById('settings-password');
  const settingsPasswordConfirm = document.getElementById('settings-password-confirm');
  
  const searchInput = document.getElementById('search-input');

  // Tab Switcher Elements
  const tabNotes = document.getElementById('tab-notes');
  const tabTasks = document.getElementById('tab-tasks');
  const workspaceContainer = document.getElementById('workspace-container');
  const tasksWorkspaceContainer = document.getElementById('tasks-workspace-container');

  // Task Creator & Filter Elements
  const taskTitleInput = document.getElementById('task-title-input');
  const taskProjectSelect = document.getElementById('task-project-select');
  const taskPrioritySelect = document.getElementById('task-priority-select');
  const btnAddTask = document.getElementById('btn-add-task');
  const tasksFilterProject = document.getElementById('tasks-filter-project');
  const btnAddStatus = document.getElementById('btn-add-status');
  const tasksColumnsContainer = document.getElementById('tasks-columns-container');

  // --- Cambio de Pestañas (Notas / Tareas) ---
  tabNotes.addEventListener('click', () => {
    currentTab = 'notes';
    tabNotes.classList.remove('btn-secondary');
    tabTasks.classList.add('btn-secondary');
    workspaceContainer.classList.remove('hidden');
    tasksWorkspaceContainer.classList.add('hidden');
  });

  tabTasks.addEventListener('click', () => {
    currentTab = 'tasks';
    tabTasks.classList.remove('btn-secondary');
    tabNotes.classList.add('btn-secondary');
    tasksWorkspaceContainer.classList.remove('hidden');
    workspaceContainer.classList.add('hidden');
    populateProjectDropdown();
    renderTasks();
  });

  // --- Modales de Diálogo Personalizados (Alertas y Confirmaciones Premium) ---
  function showCustomAlert(title, message, icon = 'info') {
    return new Promise((resolve) => {
      const overlay = document.getElementById('custom-dialog-overlay');
      const titleEl = document.getElementById('dialog-title');
      const messageEl = document.getElementById('dialog-message');
      const iconEl = document.getElementById('dialog-icon');
      const inputEl = document.getElementById('dialog-input');
      const btnConfirm = document.getElementById('btn-dialog-confirm');
      const btnCancel = document.getElementById('btn-dialog-cancel');
      
      titleEl.textContent = title;
      messageEl.textContent = message;
      iconEl.textContent = icon;
      
      inputEl.classList.add('hidden'); // Asegurarse de que el input esté oculto
      
      // Estilo de icono
      if (icon === 'error') {
        iconEl.style.color = 'var(--color-danger)';
      } else if (icon === 'check_circle') {
        iconEl.style.color = 'var(--color-success)';
      } else if (icon === 'warning') {
        iconEl.style.color = 'hsl(45, 100%, 60%)';
      } else {
        iconEl.style.color = 'var(--color-accent)';
      }
      
      btnConfirm.className = 'btn-premium';
      btnConfirm.textContent = 'Aceptar';
      btnCancel.classList.add('hidden'); // Ocultar Cancelar
      
      overlay.classList.remove('hidden');
      
      const onConfirm = () => {
        cleanup();
        resolve(true);
      };
      
      const cleanup = () => {
        btnConfirm.removeEventListener('click', onConfirm);
        overlay.classList.add('hidden');
      };
      
      btnConfirm.addEventListener('click', onConfirm);
    });
  }

  function showCustomConfirm(title, message, icon = 'help') {
    return new Promise((resolve) => {
      const overlay = document.getElementById('custom-dialog-overlay');
      const titleEl = document.getElementById('dialog-title');
      const messageEl = document.getElementById('dialog-message');
      const iconEl = document.getElementById('dialog-icon');
      const inputEl = document.getElementById('dialog-input');
      const btnConfirm = document.getElementById('btn-dialog-confirm');
      const btnCancel = document.getElementById('btn-dialog-cancel');
      
      titleEl.textContent = title;
      messageEl.textContent = message;
      iconEl.textContent = icon;
      
      inputEl.classList.add('hidden'); // Asegurarse de que el input esté oculto
      
      if (icon === 'delete') {
        iconEl.style.color = 'var(--color-danger)';
        btnConfirm.className = 'btn-premium btn-danger';
        btnConfirm.textContent = 'Eliminar';
      } else {
        iconEl.style.color = 'var(--color-accent)';
        btnConfirm.className = 'btn-premium';
        btnConfirm.textContent = 'Confirmar';
      }
      
      btnCancel.classList.remove('hidden'); // Mostrar Cancelar
      btnCancel.textContent = 'Cancelar';
      overlay.classList.remove('hidden');
      
      const onConfirm = () => {
        cleanup();
        resolve(true);
      };
      
      const onCancel = () => {
        cleanup();
        resolve(false);
      };
      
      const cleanup = () => {
        btnConfirm.removeEventListener('click', onConfirm);
        btnCancel.removeEventListener('click', onCancel);
        overlay.classList.add('hidden');
      };
      
      btnConfirm.addEventListener('click', onConfirm);
      btnCancel.addEventListener('click', onCancel);
    });
  }

  function showCustomPrompt(title, message, defaultValue = '', placeholder = '') {
    return new Promise((resolve) => {
      const overlay = document.getElementById('custom-dialog-overlay');
      const titleEl = document.getElementById('dialog-title');
      const messageEl = document.getElementById('dialog-message');
      const iconEl = document.getElementById('dialog-icon');
      const inputEl = document.getElementById('dialog-input');
      const btnConfirm = document.getElementById('btn-dialog-confirm');
      const btnCancel = document.getElementById('btn-dialog-cancel');
      
      titleEl.textContent = title;
      messageEl.textContent = message;
      iconEl.textContent = 'edit_note';
      iconEl.style.color = 'var(--color-accent)';
      
      inputEl.value = defaultValue;
      inputEl.placeholder = placeholder;
      inputEl.classList.remove('hidden'); // Mostrar campo de texto
      
      btnConfirm.className = 'btn-premium';
      btnConfirm.textContent = 'Aceptar';
      
      btnCancel.classList.remove('hidden'); // Mostrar Cancelar
      btnCancel.textContent = 'Cancelar';
      
      overlay.classList.remove('hidden');
      inputEl.focus();
      
      const onConfirm = () => {
        const value = inputEl.value;
        cleanup();
        resolve(value);
      };
      
      const onCancel = () => {
        cleanup();
        resolve(null);
      };
      
      const onKeyDown = (e) => {
        if (e.key === 'Enter') {
          onConfirm();
        } else if (e.key === 'Escape') {
          onCancel();
        }
      };
      
      const cleanup = () => {
        btnConfirm.removeEventListener('click', onConfirm);
        btnCancel.removeEventListener('click', onCancel);
        inputEl.removeEventListener('keydown', onKeyDown);
        inputEl.classList.add('hidden'); // Volver a ocultar
        overlay.classList.add('hidden');
      };
      
      btnConfirm.addEventListener('click', onConfirm);
      btnCancel.addEventListener('click', onCancel);
      inputEl.addEventListener('keydown', onKeyDown);
    });
  }

  // --- Inicialización ---
  await window.StorageEngine.loadConfig();
  updateStatusIndicators();
  
  if (window.StorageEngine.isFirstRun) {
    setupWizardOverlay.classList.remove('hidden');
  } else if (window.StorageEngine.config.isEncrypted) {
    // Mostrar pantalla de bloqueo si está encriptado
    lockScreenOverlay.classList.remove('hidden');
    lockPasswordInput.focus();
  } else {
    // Cargar directamente
    await loadAndRenderData();
  }

  // Escuchar actualizaciones de notas desde ventanas flotantes popout
  if (window.notealAPI.onNoteUpdated) {
    window.notealAPI.onNoteUpdated(async (updatedNote) => {
      let found = false;
      if (updatedNote.projectId) {
        const proj = appData.projects.find(p => p.id === updatedNote.projectId);
        if (proj) {
          const note = proj.notes.find(n => n.id === updatedNote.id);
          if (note) {
            note.title = updatedNote.title;
            note.content = updatedNote.content;
            found = true;
          }
        }
      } else {
        const note = appData.globalNotes.find(n => n.id === updatedNote.id);
        if (note) {
          note.title = updatedNote.title;
          note.content = updatedNote.content;
          found = true;
        }
      }

      if (found) {
        if (activeNote && activeNote.id === updatedNote.id) {
          activeNote.title = updatedNote.title;
          activeNote.content = updatedNote.content;
          activeNoteTitle.value = updatedNote.title;
          markdownEditor.value = updatedNote.content;
          updatePreview();
        }
        await window.StorageEngine.saveData(appData, activePassword);
        renderTree();
      }
    });
  }

  // Eventos Drag & Drop para Notas Globales (sacar notas de proyectos)
  globalNotesList.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  globalNotesList.addEventListener('dragenter', (e) => {
    e.preventDefault();
    globalNotesList.classList.add('drag-over');
  });

  globalNotesList.addEventListener('dragleave', () => {
    globalNotesList.classList.remove('drag-over');
  });

  globalNotesList.addEventListener('drop', async (e) => {
    e.preventDefault();
    globalNotesList.classList.remove('drag-over');
    
    const noteId = e.dataTransfer.getData('text/note-id');
    const sourceProjId = e.dataTransfer.getData('text/source-project-id');
    
    if (!noteId || sourceProjId === 'global') return;

    const sourceProj = appData.projects.find(p => p.id === sourceProjId);
    if (sourceProj) {
      const noteToMove = sourceProj.notes.find(n => n.id === noteId);
      if (noteToMove) {
        sourceProj.notes = sourceProj.notes.filter(n => n.id !== noteId);
        if (!appData.globalNotes) {
          appData.globalNotes = [];
        }
        appData.globalNotes.push(noteToMove);
        
        // Si es la nota activa actual, actualizar su project id
        if (activeNote && activeNote.id === noteId) {
          activeNote.projectId = null;
        }
        
        await saveDataAndRender();
      }
    }
  });

  // --- Asistente de Configuración Inicial (Wizard) ---
  let wizardSelectedPath = '';
  btnWizardSelectPath.addEventListener('click', async () => {
    const res = await window.notealAPI.selectDirectory();
    if (res && !res.canceled && res.filePaths && res.filePaths.length > 0) {
      wizardSelectedPath = res.filePaths[0];
      wizardCustomPath.value = wizardSelectedPath;
    }
  });

  wizardEngine.addEventListener('change', () => {
    if (wizardEngine.value === 'online_db') {
      wizardOnlineFields.classList.remove('hidden');
      document.getElementById('wizard-postgres-fields').classList.add('hidden');
      document.getElementById('wizard-path-group').classList.add('hidden');
    } else if (wizardEngine.value === 'postgres') {
      document.getElementById('wizard-postgres-fields').classList.remove('hidden');
      wizardOnlineFields.classList.add('hidden');
      document.getElementById('wizard-path-group').classList.add('hidden');
    } else {
      wizardOnlineFields.classList.add('hidden');
      document.getElementById('wizard-postgres-fields').classList.add('hidden');
      document.getElementById('wizard-path-group').classList.remove('hidden');
    }
  });

  const btnWizardTestPg = document.getElementById('btn-wizard-test-pg');
  btnWizardTestPg.addEventListener('click', async () => {
    const config = {
      host: document.getElementById('wizard-pg-host').value.trim(),
      port: parseInt(document.getElementById('wizard-pg-port').value) || 5432,
      database: document.getElementById('wizard-pg-db').value.trim(),
      user: document.getElementById('wizard-pg-user').value.trim(),
      password: document.getElementById('wizard-pg-password').value,
      tableName: document.getElementById('wizard-pg-table').value.trim() || 'noteal_vault',
      ssl: document.getElementById('wizard-pg-ssl').checked
    };
    if (!config.host || !config.database || !config.user) {
      await showCustomAlert('Campos Faltantes', 'Por favor complete host, base de datos y usuario.', 'warning');
      return;
    }
    btnWizardTestPg.textContent = 'Conectando...';
    const res = await window.notealAPI.postgresTestConnection(config);
    btnWizardTestPg.innerHTML = '<span class="material-symbols-outlined">database</span> Probar Conexión';
    if (res.success) {
      await showCustomAlert('Éxito', '¡Conexión establecida con éxito y tabla verificada!', 'check_circle');
    } else {
      await showCustomAlert('Error de Conexión', 'No se pudo conectar a PostgreSQL: ' + res.error, 'error');
    }
  });

  wizardEncryptCheckbox.addEventListener('change', () => {
    if (wizardEncryptCheckbox.checked) {
      wizardCryptoFields.classList.remove('hidden');
    } else {
      wizardCryptoFields.classList.add('hidden');
    }
  });

  btnWizardSubmit.addEventListener('click', async () => {
    const engine = wizardEngine.value;
    const onlineUrl = wizardOnlineUrl.value.trim();
    const onlineToken = wizardOnlineToken.value.trim();
    const isEncrypted = wizardEncryptCheckbox.checked;
    const customDir = wizardSelectedPath;
 
    const postgresConfig = {
      host: document.getElementById('wizard-pg-host').value.trim(),
      port: parseInt(document.getElementById('wizard-pg-port').value) || 5432,
      database: document.getElementById('wizard-pg-db').value.trim(),
      user: document.getElementById('wizard-pg-user').value.trim(),
      password: document.getElementById('wizard-pg-password').value,
      tableName: document.getElementById('wizard-pg-table').value.trim() || 'noteal_vault',
      ssl: document.getElementById('wizard-pg-ssl').checked
    };

    const newConfig = {
      engine,
      onlineUrl,
      onlineToken,
      isEncrypted,
      customDir,
      postgresConfig,
      passwordHash: ''
    };
 
    let password = '';
    if (isEncrypted) {
      const pass = wizardPassword.value;
      const passConfirm = wizardPasswordConfirm.value;
      if (pass.length < 4) {
        await showCustomAlert('Contraseña Inválida', 'La contraseña debe tener al menos 4 caracteres.', 'warning');
        return;
      }
      if (pass !== passConfirm) {
        await showCustomAlert('Error de Coincidencia', 'Las contraseñas no coinciden.', 'warning');
        return;
      }
      newConfig.passwordHash = window.notealAPI.hashSHA256(pass);
      password = pass;
      activePassword = pass;
    }
 
    // Crear el primer repositorio
    const repo = await window.StorageEngine.createRepository('Bóveda Principal', newConfig);
    if (!repo) {
      await showCustomAlert('Error', 'Error registrando repositorio inicial.', 'error');
      return;
    }
 
    // Datos iniciales de bienvenida
    const initialData = {
      projects: [
        {
          id: 'proj_demo',
          name: 'Proyecto de Ejemplo',
          statuses: ["Tareas pendientes", "Realizando", "Completadas"],
          notes: [
            {
              id: 'note_demo1',
              title: 'Bienvenido a NOTEAL',
              content: '# ¡Hola! Bienvenido a NOTEAL 👋\n\nEste es un workspace premium para tus notas y tareas.\n\n### Características:\n- **Editor Split-Screen:** Escribe a la izquierda y visualiza el Markdown renderizado a la derecha.\n- **Seguridad AES-256:** Tus notas pueden cifrarse con contraseña para máxima seguridad.\n- **Gestor de Tareas:** Organiza tus pendientes por prioridad y asócialos a tus proyectos.\n\n### Markdown Soportado:\n- Listas de tareas `- [ ]` interactivas.\n- Tablas completas y código fuente.\n\n*¡Disfruta organizando tu vida con NOTEAL!*',
              createdAt: new Date().toISOString()
            }
          ]
        }
      ],
      globalNotes: [
        {
          id: 'note_demo2',
          title: 'Nota rápida',
          content: '# Nota Rápida Global\n\nEsta nota no pertenece a ningún proyecto. Es útil para apuntes rápidos y recordatorios temporales.',
          createdAt: new Date().toISOString()
        }
      ],
      tasks: [
        {
          id: 'task_demo1',
          title: 'Explorar NOTEAL y su editor de notas',
          projectId: 'proj_demo',
          priority: 'high',
          completed: false,
          status: 'Tareas pendientes',
          createdAt: new Date().toLocaleDateString()
        },
        {
          id: 'task_demo2',
          title: 'Configurar mi primera base de datos en la nube',
          projectId: '',
          priority: 'medium',
          completed: false,
          status: 'Tareas pendientes',
          createdAt: new Date().toLocaleDateString()
        }
      ]
    };
 
    const dataRes = await window.StorageEngine.saveData(initialData, password);
    if (dataRes.success) {
      setupWizardOverlay.classList.add('hidden');
      await loadAndRenderData();
    } else {
      await showCustomAlert('Error', 'Error guardando los datos iniciales: ' + dataRes.error, 'error');
    }
  });

  // --- Carga y Renderizado ---
  async function loadAndRenderData() {
    try {
      appData = await window.StorageEngine.loadData(activePassword);
      if (!appData) {
        appData = { projects: [], globalNotes: [], tasks: [] };
      }
      if (!appData.projects) {
        appData.projects = [];
      }
      if (!appData.globalNotes) {
        appData.globalNotes = [];
      }
      if (!appData.tasks) {
        appData.tasks = [];
      }
      renderTree();
      updateStatusIndicators();
      if (currentTab === 'tasks') {
        renderTasks();
        populateProjectDropdown();
      }
      return true;
    } catch (error) {
      console.error(error);
      await showCustomAlert('Error', 'Error cargando notas: ' + error.message, 'error');
      return false;
    }
  }

  // Renderizar árbol de proyectos y notas principales
  function renderTree() {
    projectsList.innerHTML = '';
    globalNotesList.innerHTML = '';
 
    // Renderizar Proyectos
    appData.projects.forEach(project => {
      const projectDiv = document.createElement('div');
      projectDiv.className = 'project-item';
      projectDiv.innerHTML = `
        <div class="project-row" data-id="${project.id}" id="proj-row-${project.id}">
          <div class="project-info">
            <span class="material-symbols-outlined project-icon">folder</span>
            <span>${project.name}</span>
          </div>
          <div class="project-actions">
            <button class="btn-icon btn-tasks-proj" title="Ver Tareas" id="proj-tasks-${project.id}">
              <span class="material-symbols-outlined" style="font-size: 1.05rem;">playlist_add_check</span>
            </button>
            <button class="btn-icon btn-add-note-proj" title="Agregar Nota" id="proj-add-${project.id}">
              <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
            </button>
            <button class="btn-icon btn-edit-proj" title="Renombrar" id="proj-edit-${project.id}">
              <span class="material-symbols-outlined" style="font-size: 1.05rem;">edit</span>
            </button>
            <button class="btn-icon btn-delete-proj" title="Eliminar" id="proj-del-${project.id}">
              <span class="material-symbols-outlined" style="font-size: 1.05rem;">delete</span>
            </button>
          </div>
        </div>
        <div class="project-notes-list" id="notes-list-${project.id}"></div>
      `;
 
      // Eventos del Proyecto
      const row = projectDiv.querySelector('.project-row');
      row.addEventListener('click', () => {
        const notesList = projectDiv.querySelector('.project-notes-list');
        notesList.classList.toggle('hidden');
      });

      // Eventos Drag & Drop de Proyectos en el sidebar (para mover notas)
      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      row.addEventListener('dragenter', (e) => {
        e.preventDefault();
        row.classList.add('drag-over');
      });

      row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over');
      });

      row.addEventListener('drop', async (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');
        
        const noteId = e.dataTransfer.getData('text/note-id');
        const sourceProjId = e.dataTransfer.getData('text/source-project-id');
        
        if (!noteId || sourceProjId === project.id) return;

        // Extraer la nota de su origen
        let noteToMove = null;
        if (sourceProjId === 'global') {
          noteToMove = appData.globalNotes.find(n => n.id === noteId);
          if (noteToMove) {
            appData.globalNotes = appData.globalNotes.filter(n => n.id !== noteId);
          }
        } else {
          const sourceProj = appData.projects.find(p => p.id === sourceProjId);
          if (sourceProj) {
            noteToMove = sourceProj.notes.find(n => n.id === noteId);
            if (noteToMove) {
              sourceProj.notes = sourceProj.notes.filter(n => n.id !== noteId);
            }
          }
        }

        // Añadir la nota al destino
        if (noteToMove) {
          if (!project.notes) {
            project.notes = [];
          }
          project.notes.push(noteToMove);
          
          // Si es la nota activa actual, actualizar su project id
          if (activeNote && activeNote.id === noteId) {
            activeNote.projectId = project.id;
          }
          
          await saveDataAndRender();
        }
      });
 
      // Botón ver tareas del proyecto
      projectDiv.querySelector('.btn-tasks-proj').addEventListener('click', (e) => {
        e.stopPropagation();
        activeTasksProjectFilter = project.id;
        tabTasks.click();
      });
 
      // Botón añadir nota a proyecto
      projectDiv.querySelector('.btn-add-note-proj').addEventListener('click', (e) => {
        e.stopPropagation();
        createNewNote(project.id);
      });
 
      // Botón renombrar proyecto
      projectDiv.querySelector('.btn-edit-proj').addEventListener('click', async (e) => {
        e.stopPropagation();
        const newName = await showCustomPrompt('Renombrar Proyecto', 'Ingrese el nuevo nombre del proyecto:', project.name, 'Nombre del proyecto');
        if (newName && newName.trim()) {
          project.name = newName.trim();
          saveDataAndRender();
        }
      });
 
      // Botón eliminar proyecto
      projectDiv.querySelector('.btn-delete-proj').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (await showCustomConfirm('Eliminar Proyecto', `¿Está seguro de eliminar el proyecto "${project.name}" y todas sus notas?`, 'delete')) {
          appData.projects = appData.projects.filter(p => p.id !== project.id);
          if (activeNote && activeNote.projectId === project.id) {
            closeWorkspace();
          }
          if (activeTasksProjectFilter === project.id) {
            activeTasksProjectFilter = 'all';
          }
          saveDataAndRender();
        }
      });
 
      // Listar notas del proyecto
      const notesListContainer = projectDiv.querySelector('.project-notes-list');
      project.notes.forEach(note => {
        const noteRow = createNoteRow(note, project.id);
        notesListContainer.appendChild(noteRow);
      });
 
      projectsList.appendChild(projectDiv);
    });
 
    // Renderizar Notas Globales (Huérfanas)
    appData.globalNotes.forEach(note => {
      const noteRow = createNoteRow(note, null);
      globalNotesList.appendChild(noteRow);
    });
  }

  // Crear fila HTML de Nota
  function createNoteRow(note, projectId) {
    const noteRow = document.createElement('div');
    noteRow.className = 'note-row';
    if (activeNote && activeNote.id === note.id) {
      noteRow.classList.add('active');
    }
    
    // Habilitar Arrastre de la Nota
    noteRow.setAttribute('draggable', 'true');
    noteRow.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/note-id', note.id);
      e.dataTransfer.setData('text/source-project-id', projectId || 'global');
      e.dataTransfer.effectAllowed = 'move';
    });
    noteRow.innerHTML = `
      <div class="note-info">
        <span class="material-symbols-outlined note-icon">sticky_note</span>
        <span class="note-title-text">${note.title}</span>
      </div>
      <div class="note-actions">
        <button class="btn-icon btn-edit-note" title="Renombrar" id="note-edit-${note.id}">
          <span class="material-symbols-outlined" style="font-size: 1rem;">edit</span>
        </button>
        <button class="btn-icon btn-delete-note" title="Eliminar" id="note-del-${note.id}">
          <span class="material-symbols-outlined" style="font-size: 1rem;">delete</span>
        </button>
      </div>
    `;
 
    // Click para cargar en el workspace
    noteRow.addEventListener('click', () => {
      selectNote(note, projectId);
    });
 
    // Renombrar nota
    noteRow.querySelector('.btn-edit-note').addEventListener('click', async (e) => {
      e.stopPropagation();
      const newTitle = await showCustomPrompt('Renombrar Nota', 'Ingrese el nuevo título de la nota:', note.title, 'Título de la nota');
      if (newTitle && newTitle.trim()) {
        note.title = newTitle.trim();
        if (activeNote && activeNote.id === note.id) {
          activeNote.title = note.title;
          activeNoteTitle.value = note.title;
        }
        saveDataAndRender();
      }
    });
 
    // Eliminar nota
    noteRow.querySelector('.btn-delete-note').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (await showCustomConfirm('Eliminar Nota', `¿Está seguro de eliminar la nota "${note.title}"?`, 'delete')) {
        if (projectId) {
          const proj = appData.projects.find(p => p.id === projectId);
          if (proj) {
            proj.notes = proj.notes.filter(n => n.id !== note.id);
          }
        } else {
          appData.globalNotes = appData.globalNotes.filter(n => n.id !== note.id);
        }
        if (activeNote && activeNote.id === note.id) {
          closeWorkspace();
        }
        saveDataAndRender();
      }
    });
 
    return noteRow;
  }

  // --- Operaciones de Notas ---

  // Seleccionar nota para editar
  function selectNote(note, projectId) {
    if (activeNote) {
      saveActiveNoteChanges();
    }

    activeNote = {
      id: note.id,
      projectId,
      title: note.title,
      content: note.content || ''
    };

    activeNoteTitle.value = activeNote.title;
    markdownEditor.value = activeNote.content;
    updatePreview();

    emptyState.classList.add('hidden');
    activeNoteHeader.classList.remove('hidden');
    editorSplitPanel.classList.remove('hidden');

    document.querySelectorAll('.note-row').forEach(row => row.classList.remove('active'));
    renderTree();
  }

  // Guardar cambios locales de la nota en memoria
  function saveActiveNoteChanges() {
    if (!activeNote) return;
    
    const content = markdownEditor.value;
    const title = activeNoteTitle.value.trim() || 'Nota sin título';

    if (activeNote.projectId) {
      const proj = appData.projects.find(p => p.id === activeNote.projectId);
      if (proj) {
        const note = proj.notes.find(n => n.id === activeNote.id);
        if (note) {
          note.content = content;
          note.title = title;
        }
      }
    } else {
      const note = appData.globalNotes.find(n => n.id === activeNote.id);
      if (note) {
        note.content = content;
        note.title = title;
      }
    }
  }

  // Crear nuevo proyecto
  btnNewProject.addEventListener('click', async () => {
    const projName = await showCustomPrompt('Nuevo Proyecto', 'Ingrese el nombre del nuevo proyecto:', '', 'Nombre del proyecto');
    if (projName && projName.trim()) {
      const newProj = {
        id: 'proj_' + Date.now(),
        name: projName.trim(),
        notes: []
      };
      appData.projects.push(newProj);
      saveDataAndRender();
    }
  });

  // Crear nueva nota
  function createNewNote(projectId = null) {
    const newNote = {
      id: 'note_' + Date.now(),
      title: 'Nota Nueva',
      content: '# Hola Mundo\n\nEmpieza a escribir en Markdown...',
      createdAt: new Date().toISOString()
    };

    if (projectId) {
      const proj = appData.projects.find(p => p.id === projectId);
      if (proj) {
        proj.notes.push(newNote);
      }
    } else {
      appData.globalNotes.push(newNote);
    }

    saveDataAndRender();
    selectNote(newNote, projectId);
  }

  btnNewGlobalNote.addEventListener('click', () => {
    createNewNote(null);
  });

  // Guardar datos actuales a disco/red
  async function saveDataAndRender() {
    saveActiveNoteChanges();
    await window.StorageEngine.saveData(appData, activePassword);
    renderTree();
  }

  btnSaveNote.addEventListener('click', async () => {
    if (activeNote) {
      await saveDataAndRender();
      btnSaveNote.innerHTML = '<span class="material-symbols-outlined">check</span> Guardado';
      setTimeout(() => {
        btnSaveNote.innerHTML = '<span class="material-symbols-outlined">save</span> Guardar';
      }, 1500);
    }
  });

  // Cerrar visualización de nota activa
  function closeWorkspace() {
    activeNote = null;
    emptyState.classList.remove('hidden');
    activeNoteHeader.classList.add('hidden');
    editorSplitPanel.classList.add('hidden');
  }

  // --- Markdown Preview ---
  function updatePreview() {
    const rawMarkdown = markdownEditor.value;
    markdownPreview.innerHTML = window.notealAPI.parseMarkdown(rawMarkdown);
    
    // Convertir checkboxes en interactivos
    const listItems = markdownPreview.querySelectorAll('li');
    listItems.forEach(li => {
      const checkbox = li.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          const isChecked = checkbox.checked;
          const oldText = isChecked ? '- [ ]' : '- [x]';
          const newText = isChecked ? '- [x]' : '- [ ]';
          
          let editorText = markdownEditor.value;
          const liText = li.textContent.trim();
          
          editorText = editorText.replace(oldText + ' ' + liText, newText + ' ' + liText);
          markdownEditor.value = editorText;
          saveActiveNoteChanges();
          updatePreview();
        });
      }
    });
  }

  markdownEditor.addEventListener('input', () => {
    updatePreview();
  });

  // --- Exportar Nota ---
  btnExportNote.addEventListener('click', async () => {
    if (activeNote) {
      saveActiveNoteChanges();
      const content = markdownEditor.value;
      const title = activeNoteTitle.value.trim() || 'Nota';
      const cleanTitle = title.replace(/[/\\?%*:|"<>]/g, '-');
      
      const res = await window.notealAPI.exportMarkdown(`${cleanTitle}.md`, content);
      if (res.success) {
        await showCustomAlert('Exportación Exitosa', `Nota exportada con éxito en tu escritorio:\n📂 NOTEAL_Exports/${cleanTitle}.md`, 'check_circle');
      } else {
        await showCustomAlert('Error', 'Error exportando archivo: ' + res.error, 'error');
      }
    }
  });

  // --- Fijar Nota Flotante (Popout Window Picture-in-Picture) ---
  btnPinNote.addEventListener('click', async () => {
    if (activeNote) {
      saveActiveNoteChanges();
      const content = markdownEditor.value;
      const title = activeNoteTitle.value.trim() || 'Nota Flotante';
      
      // Lanzar el IPC para abrir la nota en una ventana flotante separada con todos sus datos
      await window.notealAPI.popoutNote({
        id: activeNote.id,
        projectId: activeNote.projectId,
        title,
        content
      });
    }
  });

  // --- Buscador en Tiempo Real ---
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    const projectRows = document.querySelectorAll('.project-item');
    const globalRows = document.querySelectorAll('#global-notes-list .note-row');

    globalRows.forEach(row => {
      const title = row.querySelector('.note-title-text').textContent.toLowerCase();
      if (title.includes(query)) {
        row.classList.remove('hidden');
      } else {
        row.classList.add('hidden');
      }
    });

    projectRows.forEach(projItem => {
      const projRow = projItem.querySelector('.project-row');
      const notesList = projItem.querySelector('.project-notes-list');
      const notesInProj = notesList.querySelectorAll('.note-row');
      
      let matchesInNotes = 0;

      notesInProj.forEach(noteRow => {
        const title = noteRow.querySelector('.note-title-text').textContent.toLowerCase();
        if (title.includes(query)) {
          noteRow.classList.remove('hidden');
          matchesInNotes++;
        } else {
          noteRow.classList.add('hidden');
        }
      });

      const projTitle = projRow.querySelector('.project-info span:last-child').textContent.toLowerCase();
      if (projTitle.includes(query) || matchesInNotes > 0) {
        projItem.classList.remove('hidden');
        if (query) {
          notesList.classList.remove('hidden');
        }
      } else {
        projItem.classList.add('hidden');
      }
    });
  });

  // --- Conmutación de Vistas ---
  btnViewToggle.addEventListener('click', () => {
    if (currentLayout === 'split') {
      currentLayout = 'editor';
      panePreview.classList.add('hidden');
      paneEditor.classList.remove('hidden');
      viewToggleIcon.textContent = 'edit';
    } else if (currentLayout === 'editor') {
      currentLayout = 'preview';
      paneEditor.classList.add('hidden');
      panePreview.classList.remove('hidden');
      viewToggleIcon.textContent = 'visibility';
    } else {
      currentLayout = 'split';
      paneEditor.classList.remove('hidden');
      panePreview.classList.remove('hidden');
      viewToggleIcon.textContent = 'vertical_split';
    }
  });

  // --- Sistema de Bloqueo por Contraseña ---
  btnUnlockVault.addEventListener('click', handleUnlock);
  lockPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  });

  async function handleUnlock() {
    const password = lockPasswordInput.value;
    if (!password) {
      lockErrorMessage.textContent = 'Por favor, ingrese una contraseña.';
      return;
    }

    const hash = window.notealAPI.hashSHA256(password);
    
    // Si no hay hash guardado (ej. migración), omitimos la validación hash directa
    // y dejamos que la verificación ocurra al intentar cargar y descifrar el archivo
    if (window.StorageEngine.config.passwordHash) {
      if (hash !== window.StorageEngine.config.passwordHash) {
        lockErrorMessage.textContent = 'Contraseña incorrecta.';
        return;
      }
    }

    activePassword = password;
    lockErrorMessage.textContent = '';
    
    try {
      const success = await loadAndRenderData();
      if (success) {
        // Si no había hash de contraseña guardado, lo guardamos ahora para futuras cargas
        if (!window.StorageEngine.config.passwordHash) {
          window.StorageEngine.config.passwordHash = hash;
          await window.StorageEngine.saveConfig({ passwordHash: hash });
        }
        lockScreenOverlay.classList.add('hidden');
        lockPasswordInput.value = '';
      } else {
        activePassword = '';
        lockErrorMessage.textContent = 'Contraseña incorrecta o error de descifrado.';
      }
    } catch (e) {
      activePassword = '';
      lockErrorMessage.textContent = 'Fallo de descifrado interno.';
    }
  }

  // --- Panel de Ajustes (Modal) ---
  let settingsSelectedPath = '';
  btnSettingsTrigger.addEventListener('click', () => {
    settingsEngine.value = window.StorageEngine.config.engine;
    settingsOnlineUrl.value = window.StorageEngine.config.onlineUrl || '';
    settingsOnlineToken.value = window.StorageEngine.config.onlineToken || '';
    settingsCustomPath.value = window.StorageEngine.config.customDir || '';
    settingsSelectedPath = window.StorageEngine.config.customDir || '';
    
    // Cargar PostgreSQL config
    const pgConfig = window.StorageEngine.config.postgresConfig || {
      host: '', port: 5432, database: '', user: '', password: '', tableName: 'noteal_vault', ssl: true
    };
    document.getElementById('settings-pg-host').value = pgConfig.host || '';
    document.getElementById('settings-pg-port').value = pgConfig.port || 5432;
    document.getElementById('settings-pg-db').value = pgConfig.database || '';
    document.getElementById('settings-pg-user').value = pgConfig.user || '';
    document.getElementById('settings-pg-password').value = pgConfig.password || '';
    document.getElementById('settings-pg-table').value = pgConfig.tableName || 'noteal_vault';
    document.getElementById('settings-pg-ssl').checked = (pgConfig.ssl !== false);

    settingsEncryptCheckbox.checked = window.StorageEngine.config.isEncrypted;
    toggleCryptoFields(window.StorageEngine.config.isEncrypted);
    toggleOnlineFields(window.StorageEngine.config.engine);

    settingsModalOverlay.classList.remove('hidden');
  });

  btnSettingsSelectPath.addEventListener('click', async () => {
    const res = await window.notealAPI.selectDirectory();
    if (res && !res.canceled && res.filePaths && res.filePaths.length > 0) {
      settingsSelectedPath = res.filePaths[0];
      settingsCustomPath.value = settingsSelectedPath;
    }
  });

  const closeSettings = () => {
    settingsModalOverlay.classList.add('hidden');
    settingsPassword.value = '';
    settingsPasswordConfirm.value = '';
  };
  
  btnCloseSettings.addEventListener('click', closeSettings);
  btnCancelSettings.addEventListener('click', closeSettings);

  settingsEngine.addEventListener('change', () => {
    toggleOnlineFields(settingsEngine.value);
  });

  function toggleOnlineFields(engine) {
    if (engine === 'online_db') {
      onlineDbFields.classList.remove('hidden');
      document.getElementById('postgres-db-fields').classList.add('hidden');
      document.getElementById('settings-path-group').classList.add('hidden');
    } else if (engine === 'postgres') {
      document.getElementById('postgres-db-fields').classList.remove('hidden');
      onlineDbFields.classList.add('hidden');
      document.getElementById('settings-path-group').classList.add('hidden');
    } else {
      onlineDbFields.classList.add('hidden');
      document.getElementById('postgres-db-fields').classList.add('hidden');
      document.getElementById('settings-path-group').classList.remove('hidden');
    }
  }

  const btnTestPgConnection = document.getElementById('btn-test-pg-connection');
  btnTestPgConnection.addEventListener('click', async () => {
    const config = {
      host: document.getElementById('settings-pg-host').value.trim(),
      port: parseInt(document.getElementById('settings-pg-port').value) || 5432,
      database: document.getElementById('settings-pg-db').value.trim(),
      user: document.getElementById('settings-pg-user').value.trim(),
      password: document.getElementById('settings-pg-password').value,
      tableName: document.getElementById('settings-pg-table').value.trim() || 'noteal_vault',
      ssl: document.getElementById('settings-pg-ssl').checked
    };
    if (!config.host || !config.database || !config.user) {
      await showCustomAlert('Campos Faltantes', 'Por favor complete host, base de datos y usuario.', 'warning');
      return;
    }
    btnTestPgConnection.textContent = 'Conectando...';
    const res = await window.notealAPI.postgresTestConnection(config);
    btnTestPgConnection.innerHTML = '<span class="material-symbols-outlined">database</span> Probar Conexión PostgreSQL';
    if (res.success) {
      await showCustomAlert('Éxito', '¡Conexión establecida con éxito y tabla verificada!', 'check_circle');
    } else {
      await showCustomAlert('Error de Conexión', 'No se pudo conectar a PostgreSQL: ' + res.error, 'error');
    }
  });

  settingsEncryptCheckbox.addEventListener('change', () => {
    toggleCryptoFields(settingsEncryptCheckbox.checked);
  });

  function toggleCryptoFields(checked) {
    if (checked) {
      cryptoFields.classList.remove('hidden');
    } else {
      cryptoFields.classList.add('hidden');
    }
  }

  btnSaveSettings.addEventListener('click', async () => {
    const engine = settingsEngine.value;
    const onlineUrl = settingsOnlineUrl.value.trim();
    const onlineToken = settingsOnlineToken.value.trim();
    const isEncrypted = settingsEncryptCheckbox.checked;
    const customDir = settingsSelectedPath;
    
    const postgresConfig = {
      host: document.getElementById('settings-pg-host').value.trim(),
      port: parseInt(document.getElementById('settings-pg-port').value) || 5432,
      database: document.getElementById('settings-pg-db').value.trim(),
      user: document.getElementById('settings-pg-user').value.trim(),
      password: document.getElementById('settings-pg-password').value,
      tableName: document.getElementById('settings-pg-table').value.trim() || 'noteal_vault',
      ssl: document.getElementById('settings-pg-ssl').checked
    };

    const newConfig = {
      engine,
      onlineUrl,
      onlineToken,
      isEncrypted,
      customDir,
      postgresConfig
    };

    if (isEncrypted) {
      const pass = settingsPassword.value;
      const passConfirm = settingsPasswordConfirm.value;

      if (!window.StorageEngine.config.isEncrypted || pass) {
        if (pass.length < 4) {
          await showCustomAlert('Contraseña Inválida', 'La contraseña debe tener al menos 4 caracteres.', 'warning');
          return;
        }
        if (pass !== passConfirm) {
          await showCustomAlert('Error de Coincidencia', 'Las contraseñas no coinciden.', 'warning');
          return;
        }
        
        newConfig.passwordHash = window.notealAPI.hashSHA256(pass);
        activePassword = pass;
      }
    } else {
      newConfig.passwordHash = '';
      activePassword = '';
    }

    const oldConfigEncrypted = window.StorageEngine.config.isEncrypted;
    
    window.StorageEngine.config.isEncrypted = isEncrypted;
    if (isEncrypted) {
      window.StorageEngine.config.passwordHash = newConfig.passwordHash;
    }
    
    // Guardar los datos primero con el motor anterior y la configuración nueva
    await window.StorageEngine.saveData(appData, activePassword);
    
    // Guardar el nuevo config.json
    const res = await window.StorageEngine.saveConfig(newConfig);
    
    if (res.success) {
      closeSettings();
      await showCustomAlert('Éxito', 'Ajustes guardados con éxito.', 'check_circle');
      updateStatusIndicators();
    } else {
      await showCustomAlert('Error', 'Error guardando configuración: ' + res.error, 'error');
    }
  });

  function updateStatusIndicators() {
    const triggerBtn = document.getElementById('btn-settings-trigger');
    if (!window.StorageEngine.config) return;
    const engine = window.StorageEngine.config.engine;
    const repoName = window.StorageEngine.config.name || 'Bóveda';
    let label = 'Archivo JSON';
    
    if (engine === 'local_db') label = 'DB Local';
    if (engine === 'online_db') label = 'DB Online';
    if (engine === 'postgres') label = 'Postgres';
    
    if (window.StorageEngine.config.isEncrypted) {
      label += ' 🔒';
    } else {
      label += ' 🔓';
    }
    
    triggerBtn.innerHTML = `<span class="material-symbols-outlined">settings</span> <span style="font-size: 0.75rem; font-weight:600; margin-left: 4px;">${escapeHTML(repoName)} (${label})</span>`;
  }

  // --- Gestor de Repositorios (Bóvedas) ---
  const btnRepositoriesTrigger = document.getElementById('btn-repositories-trigger');
  const repositoriesModalOverlay = document.getElementById('repositories-modal-overlay');
  const btnCloseRepositories = document.getElementById('btn-close-repositories');
  const btnCancelRepositories = document.getElementById('btn-cancel-repositories');
  const btnCreateRepoSubmit = document.getElementById('btn-create-repo-submit');
  const repositoriesList = document.getElementById('repositories-list');
  const newRepoName = document.getElementById('new-repo-name');
  const newRepoEngine = document.getElementById('new-repo-engine');

  btnRepositoriesTrigger.addEventListener('click', () => {
    renderRepositoriesList();
    newRepoName.value = '';
    newRepoEngine.value = 'local_json';
    repositoriesModalOverlay.classList.remove('hidden');
  });

  const closeRepositories = () => {
    repositoriesModalOverlay.classList.add('hidden');
  };

  btnCloseRepositories.addEventListener('click', closeRepositories);
  btnCancelRepositories.addEventListener('click', closeRepositories);

  btnCreateRepoSubmit.addEventListener('click', async () => {
    const name = newRepoName.value.trim();
    if (!name) {
      await showCustomAlert('Nombre Requerido', 'Por favor ingresa un nombre para el nuevo repositorio.', 'warning');
      return;
    }
    const engine = newRepoEngine.value;
    const config = { engine };
    
    await window.StorageEngine.createRepository(name, config);
    newRepoName.value = '';
    renderRepositoriesList();
    
    // Alternar automáticamente a la recién creada
    await switchRepo(window.StorageEngine.activeRepositoryId);
  });

  async function switchRepo(id) {
    const targetRepo = window.StorageEngine.repositories.find(r => r.id === id);
    if (!targetRepo) return;
    
    let password = '';
    if (targetRepo.isEncrypted) {
      // Solicitar contraseña para el nuevo repositorio
      const pass = await showCustomPrompt('Bóveda Protegida', `Ingrese la contraseña para descifrar "${targetRepo.name}":`);
      if (pass === null) return; // Cancelado
      
      const hash = window.notealAPI.hashSHA256(pass);
      if (hash !== targetRepo.passwordHash) {
        await showCustomAlert('Error', 'Contraseña incorrecta.', 'error');
        return;
      }
      password = pass;
    }
    
    activePassword = password;
    const res = await window.StorageEngine.switchRepository(id);
    if (res.success) {
      closeRepositories();
      closeWorkspace();
      await loadAndRenderData();
      await showCustomAlert('Éxito', `Conectado al repositorio "${targetRepo.name}" con éxito.`, 'check_circle');
    } else {
      await showCustomAlert('Error', 'Fallo al cambiar de repositorio: ' + res.error, 'error');
    }
  }

  function renderRepositoriesList() {
    repositoriesList.innerHTML = '';
    window.StorageEngine.repositories.forEach(repo => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'space-between';
      row.style.padding = '8px 12px';
      row.style.borderBottom = '1px solid var(--border-color)';
      row.style.borderRadius = '6px';
      row.style.background = repo.id === window.StorageEngine.activeRepositoryId ? 'hsla(263, 75%, 65%, 0.15)' : 'transparent';
      
      let badgeLabel = 'JSON';
      if (repo.engine === 'local_db') badgeLabel = 'SQLite';
      if (repo.engine === 'online_db') badgeLabel = 'REST';
      if (repo.engine === 'postgres') badgeLabel = 'Postgres';
      if (repo.isEncrypted) badgeLabel += ' 🔒';
      
      const isActive = repo.id === window.StorageEngine.activeRepositoryId;
      
      row.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-weight: 600; font-size: 0.85rem; color: ${isActive ? 'var(--color-secondary)' : 'var(--text-main)'};">${escapeHTML(repo.name)}</span>
          <span style="font-size: 0.7rem; color: var(--text-muted);">${badgeLabel}</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          ${isActive ? '<span style="font-size: 0.72rem; color: var(--color-success); font-weight:700; text-transform:uppercase;">Activo</span>' : `<button class="btn-premium btn-secondary btn-connect-repo" data-id="${repo.id}" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 4px;">Conectar</button>`}
          <button class="btn-icon btn-delete-repo" data-id="${repo.id}" style="color: var(--color-danger); padding: 4px;" title="Eliminar del Gestor">
            <span class="material-symbols-outlined" style="font-size: 1.05rem;">delete</span>
          </button>
        </div>
      `;
      
      if (!isActive) {
        row.querySelector('.btn-connect-repo').addEventListener('click', () => {
          switchRepo(repo.id);
        });
      }
      
      row.querySelector('.btn-delete-repo').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (await showCustomConfirm('Eliminar Repositorio', `¿Está seguro de eliminar el repositorio "${repo.name}" del gestor? No se borrarán los datos locales/remotos, pero no se podrá acceder desde NOTEAL a menos que lo vuelvas a registrar.`, 'delete')) {
          const wasActive = repo.id === window.StorageEngine.activeRepositoryId;
          await window.StorageEngine.deleteRepository(repo.id);
          renderRepositoriesList();
          if (wasActive) {
            closeWorkspace();
            await loadAndRenderData();
          }
        }
      });
      
      repositoriesList.appendChild(row);
    });
  }

  // --- Lógica del Gestor de Tareas ---

  function populateProjectDropdown() {
    const select = document.getElementById('task-project-select');
    select.innerHTML = '<option value="">Nota Principal (Sin Proyecto)</option>';
    
    const filterSelect = document.getElementById('tasks-filter-project');
    filterSelect.innerHTML = `
      <option value="all" ${activeTasksProjectFilter === 'all' ? 'selected' : ''}>Todos los proyectos</option>
      <option value="none" ${activeTasksProjectFilter === 'none' ? 'selected' : ''}>Sin Proyecto</option>
    `;
    
    appData.projects.forEach(project => {
      // Para el creador de tareas
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = project.name;
      select.appendChild(option);

      // Para el filtro de tareas
      const filterOption = document.createElement('option');
      filterOption.value = project.id;
      filterOption.textContent = project.name;
      if (project.id === activeTasksProjectFilter) {
        filterOption.selected = true;
      }
      filterSelect.appendChild(filterOption);
    });

    // Mostrar/ocultar el botón de añadir estado según el filtro seleccionado
    if (activeTasksProjectFilter !== 'all' && activeTasksProjectFilter !== 'none') {
      btnAddStatus.classList.remove('hidden');
    } else {
      btnAddStatus.classList.add('hidden');
    }
  }

  function renderTasks() {
    tasksColumnsContainer.innerHTML = '';
    
    if (!appData.tasks) {
      appData.tasks = [];
    }
    
    // Obtener los estados válidos según el filtro de proyecto activo
    let statuses = ["Tareas pendientes", "Realizando", "Completadas"];
    if (activeTasksProjectFilter !== 'all' && activeTasksProjectFilter !== 'none') {
      const activeProj = appData.projects.find(p => p.id === activeTasksProjectFilter);
      if (activeProj) {
        if (!activeProj.statuses) {
          activeProj.statuses = ["Tareas pendientes", "Realizando", "Completadas"];
        }
        statuses = activeProj.statuses;
      }
    }
    
    // Preparar contenedores y contadores de columnas
    const listContainers = {};
    const taskCounts = {};
    
    statuses.forEach(statusName => {
      taskCounts[statusName] = 0;
      
      const columnDiv = document.createElement('div');
      columnDiv.className = 'task-column glass-card';
      
      let iconName = 'pending_actions';
      let iconColor = 'var(--color-primary)';
      
      const lower = statusName.toLowerCase();
      if (lower.includes('completada') || lower.includes('terminada') || lower.includes('hecho') || lower.includes('done') || lower.includes('finalizada')) {
        iconName = 'task_alt';
        iconColor = 'var(--color-success)';
      } else if (lower.includes('realizando') || lower.includes('progreso') || lower.includes('proceso') || lower.includes('haciendo') || lower.includes('doing') || lower.includes('progress')) {
        iconName = 'play_circle';
        iconColor = 'var(--color-accent)';
      }
      
      const isCustomStatus = (activeTasksProjectFilter !== 'all' && activeTasksProjectFilter !== 'none') && 
                             (statusName !== 'Tareas pendientes' && statusName !== 'Completadas' && statusName !== 'Realizando');
                             
      const deleteButtonHtml = isCustomStatus 
        ? `<button class="btn-icon btn-delete-status" style="color: var(--color-danger); padding: 4px;" title="Eliminar Estado" data-status="${escapeHTML(statusName)}">
             <span class="material-symbols-outlined" style="font-size: 1rem;">close</span>
           </button>`
        : '';
        
      const statusSlug = statusName.replace(/\s+/g, '-');
      columnDiv.innerHTML = `
        <div class="column-header">
          <h3 class="column-title">
            <span class="material-symbols-outlined" style="color: ${iconColor};">${iconName}</span>
            ${escapeHTML(statusName)}
            <span class="column-badge" style="font-size: 0.75rem; color: var(--text-muted); font-weight:600; margin-left: 6px;" id="count-${statusSlug}">(0)</span>
          </h3>
          <div class="column-actions">
            ${deleteButtonHtml}
          </div>
        </div>
        <div class="column-tasks-list" id="list-${statusSlug}"></div>
      `;
      
      tasksColumnsContainer.appendChild(columnDiv);
      const listContainer = columnDiv.querySelector('.column-tasks-list');
      listContainers[statusName] = listContainer;
      
      // Eventos Drag & Drop de la Columna
      listContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      
      listContainer.addEventListener('dragenter', (e) => {
        listContainer.classList.add('drag-over');
      });
      
      listContainer.addEventListener('dragleave', (e) => {
        listContainer.classList.remove('drag-over');
      });
      
      listContainer.addEventListener('drop', async (e) => {
        e.preventDefault();
        listContainer.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        const task = appData.tasks.find(t => t.id === taskId);
        if (task) {
          task.status = statusName;
          task.completed = (statusName === statuses[statuses.length - 1]);
          await saveDataAndRender();
          renderTasks();
        }
      });
      
      if (isCustomStatus) {
        columnDiv.querySelector('.btn-delete-status').addEventListener('click', async (e) => {
          e.stopPropagation();
          const statusToDelete = e.currentTarget.getAttribute('data-status');
          if (await showCustomConfirm('Eliminar Estado', `¿Está seguro de eliminar el estado "${statusToDelete}"? Las tareas en este estado volverán a "${statuses[0]}".`, 'delete')) {
            const proj = appData.projects.find(p => p.id === activeTasksProjectFilter);
            if (proj && proj.statuses) {
              proj.statuses = proj.statuses.filter(s => s !== statusToDelete);
              
              appData.tasks.forEach(t => {
                if (t.projectId === activeTasksProjectFilter && t.status === statusToDelete) {
                  t.status = proj.statuses[0];
                  t.completed = false;
                }
              });
              
              await saveDataAndRender();
              renderTasks();
            }
          }
        });
      }
    });
    
    // Filtrar tareas por el filtro de proyecto activo
    const filteredTasks = appData.tasks.filter(task => {
      if (activeTasksProjectFilter === 'all') return true;
      if (activeTasksProjectFilter === 'none') return !task.projectId;
      return task.projectId === activeTasksProjectFilter;
    });
    
    let totalPending = 0;
    let totalCompleted = 0;
    
    filteredTasks.forEach(task => {
      // Mapeo retrocompatible (sin mutar permanentemente el estado en la base de datos a menos que sea necesario)
      let displayStatus = task.status;
      if (!displayStatus || !statuses.includes(displayStatus)) {
        if (task.completed) {
          displayStatus = statuses[statuses.length - 1];
        } else {
          displayStatus = statuses[0];
        }
      }
      
      if (task.completed) {
        totalCompleted++;
      } else {
        totalPending++;
      }
      
      taskCounts[displayStatus] = (taskCounts[displayStatus] || 0) + 1;
      
      const taskCard = document.createElement('div');
      taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;
      
      // Habilitar Arrastre de la Tarjeta
      taskCard.setAttribute('draggable', 'true');
      taskCard.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      });
      
      let projectName = '';
      if (task.projectId) {
        const proj = appData.projects.find(p => p.id === task.projectId);
        projectName = proj ? proj.name : '';
      }
      
      const projectBadgeHtml = projectName 
        ? `<span class="task-project-badge">${escapeHTML(projectName)}</span>` 
        : '';
        
      const priorityLabel = task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja';
      const priorityClass = `priority-${task.priority}`;
      
      let statusOptionsHtml = '';
      statuses.forEach(s => {
        statusOptionsHtml += `<option value="${escapeHTML(s)}" ${displayStatus === s ? 'selected' : ''}>${escapeHTML(s)}</option>`;
      });
      
      taskCard.innerHTML = `
        <div class="task-header">
          <div class="task-title-group">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-title">${escapeHTML(task.title)}</span>
          </div>
          <button class="btn-icon btn-delete-task" style="color: var(--color-danger); opacity: 0.8;" title="Eliminar Tarea">
            <span class="material-symbols-outlined" style="font-size: 1.1rem;">delete</span>
          </button>
        </div>
        <div class="task-meta" style="margin-top: 6px;">
          <span class="task-priority-badge ${priorityClass}">${priorityLabel}</span>
          ${projectBadgeHtml}
          <span class="task-date">${task.createdAt || ''}</span>
        </div>
        <div class="task-status-row" style="margin-top: 8px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 8px;">
          <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Estado:</span>
          <select class="task-status-select">
            ${statusOptionsHtml}
          </select>
        </div>
      `;
      
      const checkbox = taskCard.querySelector('.task-checkbox');
      checkbox.addEventListener('change', async () => {
        task.completed = checkbox.checked;
        if (task.completed) {
          task.status = statuses[statuses.length - 1];
        } else {
          task.status = statuses[0];
        }
        await saveDataAndRender();
        renderTasks();
      });
      
      const statusSelect = taskCard.querySelector('.task-status-select');
      statusSelect.addEventListener('change', async () => {
        task.status = statusSelect.value;
        task.completed = (task.status === statuses[statuses.length - 1]);
        await saveDataAndRender();
        renderTasks();
      });
      
      const btnDelete = taskCard.querySelector('.btn-delete-task');
      btnDelete.addEventListener('click', async () => {
        if (await showCustomConfirm('Eliminar Tarea', `¿Desea eliminar la tarea "${task.title}"?`, 'delete')) {
          appData.tasks = appData.tasks.filter(t => t.id !== task.id);
          await saveDataAndRender();
          renderTasks();
        }
      });
      
      const container = listContainers[displayStatus];
      if (container) {
        container.appendChild(taskCard);
      }
    });
    
    document.getElementById('task-stats-summary').textContent = `Pendientes: ${totalPending} | Completadas: ${totalCompleted}`;
    
    statuses.forEach(statusName => {
      const badge = document.getElementById(`count-${statusName.replace(/\s+/g, '-')}`);
      if (badge) {
        badge.textContent = `(${taskCounts[statusName] || 0})`;
      }
    });
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Event listener para el filtro de proyectos
  tasksFilterProject.addEventListener('change', () => {
    activeTasksProjectFilter = tasksFilterProject.value;
    if (activeTasksProjectFilter !== 'all' && activeTasksProjectFilter !== 'none') {
      btnAddStatus.classList.remove('hidden');
    } else {
      btnAddStatus.classList.add('hidden');
    }
    renderTasks();
  });

  // Event listener para añadir estados
  btnAddStatus.addEventListener('click', async () => {
    if (activeTasksProjectFilter === 'all' || activeTasksProjectFilter === 'none') return;
    
    const proj = appData.projects.find(p => p.id === activeTasksProjectFilter);
    if (!proj) return;
    
    const newStatus = await showCustomPrompt('Nuevo Estado', 'Ingrese el nombre del nuevo estado:', '', 'Nombre del estado');
    if (newStatus && newStatus.trim()) {
      const cleanStatus = newStatus.trim();
      
      if (!proj.statuses) {
        proj.statuses = ["Tareas pendientes", "Realizando", "Completadas"];
      }
      
      if (proj.statuses.includes(cleanStatus)) {
        await showCustomAlert('Estado Duplicado', 'Ya existe un estado con ese nombre en este proyecto.', 'warning');
        return;
      }
      
      // Insertar antes del último estado (que es Completadas)
      const lastIndex = proj.statuses.length > 0 ? proj.statuses.length - 1 : 0;
      proj.statuses.splice(lastIndex, 0, cleanStatus);
      
      await saveDataAndRender();
      renderTasks();
    }
  });

  btnAddTask.addEventListener('click', async () => {
    const title = taskTitleInput.value.trim();
    if (!title) {
      await showCustomAlert('Campo Requerido', 'Por favor ingrese el título de la tarea.', 'warning');
      return;
    }
    
    let initialStatus = 'Tareas pendientes';
    const selectedProjId = taskProjectSelect.value;
    if (selectedProjId) {
      const proj = appData.projects.find(p => p.id === selectedProjId);
      if (proj) {
        if (!proj.statuses) {
          proj.statuses = ["Tareas pendientes", "Realizando", "Completadas"];
        }
        initialStatus = proj.statuses[0];
      }
    }
    
    const newTask = {
      id: 'task_' + Date.now(),
      title,
      projectId: selectedProjId,
      priority: taskPrioritySelect.value,
      completed: false,
      status: initialStatus,
      createdAt: new Date().toLocaleDateString()
    };
    
    if (!appData.tasks) {
      appData.tasks = [];
    }
    
    appData.tasks.push(newTask);
    await saveDataAndRender();
    
    taskTitleInput.value = '';
    renderTasks();
  });

  taskTitleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnAddTask.click();
    }
  });

  // --- Lógica de la Barra de Herramientas Markdown ---
  document.querySelectorAll('.btn-toolbar').forEach(btn => {
    btn.addEventListener('click', () => {
      let template = btn.getAttribute('data-template') || '';
      // Reemplazar la secuencia literal \n por saltos de línea reales
      template = template.replace(/\\n/g, '\n');
      const start = markdownEditor.selectionStart;
      const end = markdownEditor.selectionEnd;
      const text = markdownEditor.value;
      
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      
      // Formatear saltos de línea para elementos de bloque (título, tabla, bloque de código, listas)
      let insertion = template;
      const isBlock = template.startsWith('#') || template.startsWith('-') || template.startsWith('|') || template.startsWith('```');
      if (isBlock && start > 0 && text[start - 1] !== '\n') {
        insertion = '\n' + template;
      }
      
      markdownEditor.value = before + insertion + after;
      
      // Poner foco y restablecer cursor después de la inserción
      markdownEditor.focus();
      const newCursorPos = start + insertion.length;
      markdownEditor.setSelectionRange(newCursorPos, newCursorPos);
      
      saveActiveNoteChanges();
      updatePreview();
    });
  });
});
