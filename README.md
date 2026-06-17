# NOTEAL 📓🚀

**NOTEAL** es un workspace de notas interactivas y gestor de proyectos premium diseñado en **modo oscuro neón** con una estética elegante y moderna. Construido con **Electron**, permite tomar apuntes estructurados en Markdown, gestionar tareas mediante un tablero Kanban dinámico y sincronizar todo de forma segura a través de encriptación local o conexiones a bases de datos directas.

---

## ✨ Características Principales

- 📝 **Editor Split-Screen en Markdown:** Escribe notas utilizando sintaxis Markdown con previsualización interactiva en tiempo real (GFM).
- 🗂️ **Tablero Kanban de Tareas:** Organiza tus pendientes por prioridades (Baja, Media, Alta) y proyectos mediante arrastre fluido (Drag & Drop).
- 📂 **Organización por Drag & Drop:** Mueve tus notas entre proyectos o sácalas al listado global arrastrándolas directamente en la barra lateral.
- 🗄️ **Múltiples Bóvedas (Repositorios):** Crea y administra múltiples repositorios independientes en local o en la nube y alterna entre ellos con un solo clic.
- ☁️ **Sincronización Directa con PostgreSQL/Supabase:** Conecta tus notas directamente a tu base de datos relacional externa con creación automática de tablas y consultas seguras parametrizadas.
- 📌 **Notas Flotantes (Picture-in-Picture):** Fija cualquier nota al frente en una ventana flotante sin bordes. Ahora con **soporte de edición y sincronización automática en tiempo real** hacia la ventana principal.
- 🔒 **Seguridad AES-256:** Cifra localmente tus archivos de notas y tareas con protección por contraseña.

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalado en tu sistema:
- **Node.js** (versión 18.0 o superior recomendada)
- **NPM** (incluido con Node.js)

---

## 🚀 Cómo Ejecutar el Proyecto

Sigue estos sencillos pasos para poner en marcha NOTEAL en modo de desarrollo:

### 1. Clonar el repositorio e ingresar a la carpeta
```bash
git clone <url-del-repositorio>
cd noteal
```

### 2. Instalar las dependencias
Este comando descargará todos los paquetes requeridos (Electron, Jimp, Marked, pg para Postgres, CryptoJS, etc.):
```bash
npm install
```

### 3. Iniciar la aplicación
Ejecuta NOTEAL en tu entorno local:
```bash
npm start
```

---

## 📦 Cómo Empaquetar / Crear el Ejecutable (.exe)

NOTEAL está preparado para empaquetarse de manera sencilla para sistemas operativos Windows (x64):

### Re-generar Iconos (Opcional)
Si modificas la imagen PNG de la marca (`src/assets/icon.png`), puedes generar automáticamente el icono nativo de Windows ejecutando:
```bash
node convert-icon.js
```

### Empaquetar
Para compilar y empaquetar la aplicación en un paquete de producción libre de herramientas de desarrollo (DevTools) y optimizado:
```bash
npm run package
```
El instalable y ejecutable resultante se creará en el directorio:
📁 `dist/NOTEAL-win32-x64/`

---

## 📂 Estructura del Código

- `main.js`: Proceso principal de Electron. Controla el ciclo de vida de la app, crea las ventanas de visualización, define el bridge de base de datos Postgres y gestiona los diálogos del sistema.
- `preload.js`: Capa intermedia (Context Bridge) segura. Expone las APIs nativas de Electron al renderizador sin comprometer la seguridad.
- `convert-icon.js`: Script utilitario para transformar el PNG principal de NOTEAL en un recurso `.ico` multidispositivo.
- `src/`:
  - `index.html`: Interfaz del workspace principal.
  - `popout.html`: Interfaz flotante Picture-in-Picture con soporte de edición.
  - `renderer.js`: Lógica de comportamiento de la UI (barra lateral, editor de markdown, Kanban, drag-and-drop y sincronización).
  - `storage.js`: Abstracción del almacenamiento (Local JSON, SQLite simulada y Postgres).
  - `styles.css`: Estilos visuales neón oscuros (HSL) de la interfaz.

---

## 🤝 Cómo Aportar al Proyecto

¡Las contribuciones son bienvenidas y muy valoradas! Para colaborar con el proyecto, sigue estos pasos:

1. **Haz un Fork** del repositorio.
2. **Crea una nueva rama** para tu funcionalidad o corrección de error:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Realiza tus cambios** y asegúrate de mantener el estilo limpio del código.
4. **Haz commit** de tus modificaciones con mensajes claros y descriptivos:
   ```bash
   git commit -m "feat: agrega soporte para re-ordenar notas con drag and drop"
   ```
5. **Sube tu rama** al repositorio remoto:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
6. Abre un **Pull Request** detallando los cambios que has introducido y por qué son necesarios.

---

## 📝 Licencia

Este proyecto está bajo la licencia ISC. Creado originalmente por **Study Academy**.
