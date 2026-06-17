/**
 * Capa de Abstracción de Almacenamiento para NOTEAL.
 * Soporta:
 * 1. Archivo JSON Local ('local_json')
 * 2. Base de Datos Embebida Local simulada ('local_db')
 * 3. Base de Datos Online vía REST API ('online_db')
 * 4. Conexión Directa a PostgreSQL/Supabase ('postgres')
 */

class NotealStorage {
  constructor() {
    this.config = {
      id: '',
      name: '',
      engine: 'local_json', // 'local_json' | 'local_db' | 'online_db' | 'postgres'
      onlineUrl: '',
      onlineToken: '',
      passwordHash: '', // Hash SHA256 para validación rápida
      isEncrypted: false,
      customDir: '', // Directorio de guardado personalizado
      postgresConfig: {
        host: '',
        port: 5432,
        database: '',
        user: '',
        password: '',
        ssl: true,
        tableName: 'noteal_vault'
      }
    };
    
    this.activeRepositoryId = '';
    this.repositories = [];
    
    this.defaultData = {
      projects: [],
      globalNotes: [],
      tasks: [] // Gestor de tareas
    };

    this.isFirstRun = false;
  }

  // Cargar configuración de almacenamiento y listado de repositorios
  async loadConfig() {
    try {
      const res = await window.notealAPI.readLocalFile('repositories.json');
      if (res.success && res.data) {
        const parsed = JSON.parse(res.data);
        this.repositories = parsed.repositories || [];
        this.activeRepositoryId = parsed.activeRepositoryId || '';
        
        const activeRepo = this.repositories.find(r => r.id === this.activeRepositoryId);
        if (activeRepo) {
          this.config = activeRepo;
          this.isFirstRun = false;
        } else {
          if (this.repositories.length > 0) {
            this.activeRepositoryId = this.repositories[0].id;
            this.config = this.repositories[0];
            this.isFirstRun = false;
          } else {
            this.isFirstRun = true;
          }
        }
      } else {
        // Intentar migrar configuración antigua si existe
        const oldConfigRes = await window.notealAPI.readLocalFile('config.json');
        if (oldConfigRes.success && oldConfigRes.data) {
          const oldConfig = JSON.parse(oldConfigRes.data);
          const firstRepo = {
            id: 'repo_' + Date.now(),
            name: 'Bóveda Principal',
            engine: oldConfig.engine || 'local_json',
            onlineUrl: oldConfig.onlineUrl || '',
            onlineToken: oldConfig.onlineToken || '',
            passwordHash: oldConfig.passwordHash || '',
            isEncrypted: !!oldConfig.isEncrypted,
            customDir: oldConfig.customDir || '',
            postgresConfig: oldConfig.postgresConfig || {
              host: '',
              port: 5432,
              database: '',
              user: '',
              password: '',
              ssl: true,
              tableName: 'noteal_vault'
            }
          };
          this.repositories = [firstRepo];
          this.activeRepositoryId = firstRepo.id;
          this.config = firstRepo;
          this.isFirstRun = false;
          await this.saveRepositories();
        } else {
          this.isFirstRun = true; // No existe archivo de config
        }
      }
    } catch (e) {
      console.error('Error cargando configuración:', e);
      this.isFirstRun = true;
    }
    return this.config;
  }

  // Guardar archivo global de repositorios
  async saveRepositories() {
    try {
      const data = {
        activeRepositoryId: this.activeRepositoryId,
        repositories: this.repositories
      };
      await window.notealAPI.saveLocalFile('repositories.json', JSON.stringify(data, null, 2));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Guardar configuración de almacenamiento del repositorio activo
  async saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Actualizar en la lista de repositorios
    const index = this.repositories.findIndex(r => r.id === this.config.id);
    if (index !== -1) {
      this.repositories[index] = this.config;
    }
    
    return await this.saveRepositories();
  }

  // Crear un nuevo repositorio de notas
  async createRepository(name, config) {
    const newRepo = {
      id: 'repo_' + Date.now(),
      name: name || 'Nuevo Repositorio',
      engine: config.engine || 'local_json',
      onlineUrl: config.onlineUrl || '',
      onlineToken: config.onlineToken || '',
      passwordHash: config.passwordHash || '',
      isEncrypted: !!config.isEncrypted,
      customDir: config.customDir || '',
      postgresConfig: config.postgresConfig || {
        host: '',
        port: 5432,
        database: '',
        user: '',
        password: '',
        ssl: true,
        tableName: 'noteal_vault'
      }
    };
    
    this.repositories.push(newRepo);
    this.activeRepositoryId = newRepo.id;
    this.config = newRepo;
    this.isFirstRun = false;
    
    await this.saveRepositories();
    return newRepo;
  }

  // Alternar al perfil de repositorio seleccionado
  async switchRepository(id) {
    const repo = this.repositories.find(r => r.id === id);
    if (!repo) return { success: false, error: 'Repositorio no encontrado.' };
    
    this.activeRepositoryId = id;
    this.config = repo;
    await this.saveRepositories();
    return { success: true, config: repo };
  }

  // Eliminar un repositorio del listado
  async deleteRepository(id) {
    this.repositories = this.repositories.filter(r => r.id !== id);
    if (this.activeRepositoryId === id) {
      if (this.repositories.length > 0) {
        this.activeRepositoryId = this.repositories[0].id;
        this.config = this.repositories[0];
      } else {
        this.activeRepositoryId = '';
        this.config = null;
        this.isFirstRun = true;
      }
    }
    await this.saveRepositories();
    return { success: true };
  }

  // Cargar notas según el motor activo y contraseña (si está habilitada)
  async loadData(password = '') {
    let rawDataString = '';
    
    // 1. Obtener datos del motor seleccionado
    if (this.config.engine === 'postgres' && this.config.postgresConfig) {
      const res = await window.notealAPI.postgresLoadData(this.config.postgresConfig);
      if (res.success) {
        rawDataString = res.data || '';
      } else {
        throw new Error('Fallo al conectar a PostgreSQL: ' + res.error);
      }
    } else if (this.config.engine === 'online_db' && this.config.onlineUrl) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (this.config.onlineToken) {
          headers['Authorization'] = `Bearer ${this.config.onlineToken}`;
          headers['apikey'] = this.config.onlineToken; // Cabecera requerida por Supabase
        }
        
        const baseUrl = this.config.onlineUrl.endsWith('/') 
          ? this.config.onlineUrl.slice(0, -1) 
          : this.config.onlineUrl;

        const res = await fetch(`${baseUrl}/notes`, {
          method: 'GET',
          headers
        });
        if (res.ok) {
          const body = await res.json();
          if (Array.isArray(body)) {
            // Si es un array (como devuelve Supabase/Postgrest), tomamos el último registro según la fecha
            if (body.length > 0) {
              body.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
              rawDataString = body[0].data || '';
            } else {
              rawDataString = '';
            }
          } else if (body && typeof body === 'object') {
            rawDataString = body.data || JSON.stringify(body);
          } else {
            rawDataString = typeof body === 'string' ? body : '';
          }
        } else {
          throw new Error(`Error en servidor online: ${res.status}`);
        }
      } catch (e) {
        console.warn('Fallo al conectar con la base de datos online, usando fallback local...', e);
        // Fallback a archivo local en caso de desconexión
        const localRes = await window.notealAPI.readLocalFile('fallback_notes.json', this.config.customDir);
        rawDataString = localRes.data || '';
      }
    } else if (this.config.engine === 'local_db') {
      // Simulación de Base de Datos Local
      const res = await window.notealAPI.readLocalFile('noteal_database.db', this.config.customDir);
      rawDataString = res.data || '';
    } else {
      // Por defecto: Local JSON File
      const res = await window.notealAPI.readLocalFile('storage.json', this.config.customDir);
      rawDataString = res.data || '';
    }

    if (!rawDataString) {
      return this.defaultData;
    }

    // 2. Desencriptar si corresponde
    if (this.config.isEncrypted) {
      if (!password) {
        throw new Error('Se requiere contraseña para descifrar los datos.');
      }
      
      // Resiliencia contra archivos en texto plano (sin cifrar)
      const trimmed = rawDataString.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          // No es JSON plano válido, proceder con el descifrado normal
        }
      }
      
      const decrypted = window.notealAPI.decryptText(rawDataString, password);
      if (!decrypted) {
        throw new Error('Contraseña incorrecta: No se pudieron descifrar los datos.');
      }
      return JSON.parse(decrypted);
    }

    // Datos planos
    try {
      return JSON.parse(rawDataString);
    } catch (e) {
      console.error('Error parseando JSON de notas:', e);
      return this.defaultData;
    }
  }

  // Guardar notas según el motor activo y encriptar (si corresponde)
  async saveData(data, password = '') {
    let dataToWrite = JSON.stringify(data, null, 2);

    // 1. Encriptar si corresponde
    if (this.config.isEncrypted) {
      if (!password) {
        return { success: false, error: 'Se requiere la contraseña para guardar de forma segura.' };
      }
      dataToWrite = window.notealAPI.encryptText(dataToWrite, password);
    }

    // 2. Guardar en el motor correspondiente
    try {
      if (this.config.engine === 'postgres' && this.config.postgresConfig) {
        const res = await window.notealAPI.postgresSaveData(this.config.postgresConfig, dataToWrite);
        if (!res.success) {
          throw new Error('Error guardando en PostgreSQL: ' + res.error);
        }
      } else if (this.config.engine === 'online_db' && this.config.onlineUrl) {
        // Guardar online
        const headers = { 'Content-Type': 'application/json' };
        if (this.config.onlineToken) {
          headers['Authorization'] = `Bearer ${this.config.onlineToken}`;
          headers['apikey'] = this.config.onlineToken; // Cabecera requerida por Supabase
        }
        
        const baseUrl = this.config.onlineUrl.endsWith('/') 
          ? this.config.onlineUrl.slice(0, -1) 
          : this.config.onlineUrl;
        
        // Enviamos la cadena (encriptada o plana) al API
        const res = await fetch(`${baseUrl}/notes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ data: dataToWrite, updatedAt: new Date().toISOString() })
        });
        
        // Guardamos también una copia local de respaldo
        await window.notealAPI.saveLocalFile('fallback_notes.json', dataToWrite, this.config.customDir);
        
        if (!res.ok) {
          throw new Error(`Error en servidor online: ${res.status}`);
        }
      } else if (this.config.engine === 'local_db') {
        // Base de Datos Local Embebida (Simulada en archivo .db)
        await window.notealAPI.saveLocalFile('noteal_database.db', dataToWrite, this.config.customDir);
      } else {
        // Archivo JSON Local
        await window.notealAPI.saveLocalFile('storage.json', dataToWrite, this.config.customDir);
      }
      return { success: true };
    } catch (e) {
      console.error('Error guardando datos:', e);
      return { success: false, error: e.message };
    }
  }
}

window.StorageEngine = new NotealStorage();
