const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getTargets() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Matando procesos previos de NOTEAL...');
  try {
    spawn('taskkill', ['/F', '/IM', 'NOTEAL.exe'], { shell: true });
    spawn('taskkill', ['/F', '/IM', 'electron.exe'], { shell: true });
  } catch (e) {}
  await wait(1000);

  console.log('Iniciando Electron...');
  const appDir = path.join(__dirname, '..');
  const electron = spawn('npx', ['electron', '.', '--remote-debugging-port=9222'], {
    cwd: appDir,
    shell: true
  });

  let targets = null;
  for (let i = 0; i < 15; i++) {
    await wait(1000);
    try {
      targets = await getTargets();
      if (targets && targets.length > 0) {
        break;
      }
    } catch (e) {}
  }

  if (!targets || targets.length === 0) {
    console.error('No se pudo conectar.');
    electron.kill();
    process.exit(1);
  }

  const mainTarget = targets.find(t => t.url.includes('index.html')) || targets[0];
  const ws = new WebSocket(mainTarget.webSocketDebuggerUrl);

  let messageId = 1;
  const send = (method, params = {}) => {
    const id = messageId++;
    ws.send(JSON.stringify({ id, method, params }));
    return id;
  };

  ws.onopen = async () => {
    send('Runtime.enable');
    send('Console.enable');

    console.log('Esperando inicialización de la app...');
    await wait(3000);

    console.log('Ejecutando interacción de desbloqueo, tab click y modal click...');
    send('Runtime.evaluate', {
      expression: `(async () => {
        const results = [];
        const log = (msg) => results.push(msg);
        
        try {
          // 1. Verificar si está en la pantalla de bloqueo
          const lockScreen = document.getElementById('lock-screen-overlay');
          const isLocked = lockScreen && !lockScreen.classList.contains('hidden');
          log('Pantalla de bloqueo activa: ' + isLocked);
          
          if (isLocked) {
            // Si está bloqueado, intentamos descifrar. Intentamos contraseña en blanco o por defecto
            const passInput = document.getElementById('lock-password-input');
            const unlockBtn = document.getElementById('btn-unlock-vault');
            
            // Intentar contraseñas comunes si el usuario la tiene vacía
            passInput.value = ''; // Intentar contraseña vacía primero
            log('Intentando desbloqueo con contraseña vacía...');
            unlockBtn.click();
            await new Promise(r => setTimeout(r, 1000));
            
            const stillLocked = !lockScreen.classList.contains('hidden');
            log('¿Sigue bloqueado? ' + stillLocked);
            if (stillLocked) {
              log('No se pudo desbloquear automáticamente. Pruebe desbloqueando la app en su pantalla antes de este test.');
              return { results, success: false };
            }
          }
          
          // 2. Click a la pestaña de tareas
          const tabTasks = document.getElementById('tab-tasks');
          log('Haciendo click en la pestaña de Tareas...');
          tabTasks.click();
          await new Promise(r => setTimeout(r, 500));
          
          // 3. Verificar si el Kanban se renderizó
          const columnsContainer = document.getElementById('tasks-columns-container');
          log('Columnas renderizadas: ' + (columnsContainer ? columnsContainer.children.length : 0));
          
          // 4. Click en el botón "Nueva Tarea"
          const newBtn = document.getElementById('btn-new-task-trigger');
          log('¿Existe botón Nueva Tarea?: ' + !!newBtn);
          if (newBtn) {
            log('Haciendo click en Nueva Tarea...');
            newBtn.click();
            await new Promise(r => setTimeout(r, 500));
            
            const modal = document.getElementById('task-modal-overlay');
            log('Clases del modal de tareas: ' + (modal ? modal.className : 'no existe'));
          }
          
          return { results, success: true };
        } catch (e) {
          log('EXCEPTION: ' + e.message + '\\n' + e.stack);
          return { results, success: false };
        }
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      const type = msg.params.type;
      const args = msg.params.args.map(a => a.value || a.description || '').join(' ');
      console.log(`[CONSOLE ${type.toUpperCase()}] ${args}`);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[EXCEPTION THROWN]', msg.params.exceptionDetails);
    } else if (msg.result) {
      console.log('[RESULT]', JSON.stringify(msg.result, null, 2));
    }
  };

  await wait(8000);
  console.log('Prueba terminada.');
  ws.close();
  electron.kill();
  process.exit(0);
}

main().catch(console.error);
