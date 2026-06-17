# NOTEAL 📓🚀

[English Version](#english) | [Versión en Español](#español)

---

## English

**NOTEAL** is a premium dark-mode interactive workspace and project manager desktop application designed with a sleek neón aesthetic. Built with **Electron**, it allows you to write structured notes in Markdown, manage tasks via a dynamic Kanban board, and sync everything securely using local encryption or direct external database connections.

---

### ✨ Key Features

- 📝 **Split-Screen Markdown Editor:** Write notes using Markdown syntax with live, interactive preview (GFM) on the right pane.
- 🗂️ **Kanban Task Board:** Organize your tasks by priorities (Low, Medium, High) and project folders with smooth drag-and-drop mechanics.
- 📂 **Drag & Drop Note Relocation:** Move your notes between project folders or make them global by dragging them directly in the sidebar tree.
- 🗄️ **Multi-Vault Management:** Register, delete, and switch between multiple local or cloud vaults/repositories with a single click.
- ☁️ **Direct PostgreSQL & Supabase Sync:** Link your vaults directly to a PostgreSQL database. Features automatic table schema initialization and parameterized queries.
- 📌 **Editable Picture-in-Picture Popouts:** Pin any note as a borderless window that stays always-on-top. Now with **in-window inline editing (title & content) and real-time IPC synchronization** back to the main workspace.
- 🔒 **AES-256 Client-side Encryption:** Secure your local json databases with password protection.

---

### 🛠️ Prerequisites

Make sure you have the following installed:
- **Node.js** (v18.0 or higher recommended)
- **NPM** (comes pre-packaged with Node.js)

---

### 🚀 Getting Started

Follow these steps to run NOTEAL locally in development mode:

1. **Clone the repository and enter the directory**
   ```bash
   git clone <repository-url>
   cd noteal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

---

### 📦 Packaging / Creating the Executable (.exe)

NOTEAL can be packaged easily for Windows (x64) environments:

#### Recompile Windows Icons (Optional)
If you update the primary brand image (`src/assets/icon.png`), recompile the `.ico` file using the helper script:
```bash
node convert-icon.js
```

#### Package the App
To bundle the application into a distribution folder (optimized, and with DevTools disabled):
```bash
npm run package
```
The output directory will be:
📁 `dist/NOTEAL-win32-x64/`

---

### 📂 Directory Structure

- `main.js`: Main Electron process. Controls the app lifecycle, window creation, IPC events, and Postgres connections.
- `preload.js`: Secure context bridge. Exposes API hooks to the renderer process safely.
- `convert-icon.js`: Automation script to compile the PNG image into a multi-resolution `.ico` icon.
- `src/`:
  - `index.html`: Main workspace UI template.
  - `popout.html`: Floating PiP note editor UI.
  - `renderer.js`: UI behavior controller (markdown rendering, sidebar, Kanban columns, drag-and-drop, and synchronization).
  - `storage.js`: Storage abstraction layer (Local JSON, SQLite simulator, and PostgreSQL sync).
  - `styles.css`: HSL dark-neón global styling.

---

### 🤝 Contributing

Contributions are welcome! To contribute to NOTEAL:

1. **Fork** the repository.
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/cool-new-feature
   ```
3. **Make your changes** keeping the code clean.
4. **Commit** your modifications with clear messages:
   ```bash
   git commit -m "feat: add drag and drop note reordering"
   ```
5. **Push** your branch:
   ```bash
   git push origin feature/cool-new-feature
   ```
6. Open a **Pull Request** detailing your changes.

---

### 📝 License

This project is licensed under the ISC License. Created by **Study Academy**.

---
---

## Español

**NOTEAL** es un workspace de notas interactivas y gestor de proyectos premium diseñado en **modo oscuro neón** con una estética elegante y moderna. Construido con **Electron**, permite tomar apuntes estructurados en Markdown, gestionar tareas mediante un tablero Kanban dinámico y sincronizar todo de forma segura a través de encriptación local o conexiones a bases de datos directas.

---

### ✨ Características Principales

- 📝 **Editor Split-Screen en Markdown:** Escribe notas utilizando sintaxis Markdown con previsualización interactiva en tiempo real (GFM).
- 🗂️ **Tablero Kanban de Tareas:** Organiza tus pendientes por prioridades (Baja, Media, Alta) y proyectos mediante arrastre fluido (Drag & Drop).
- 📂 **Organización por Drag & Drop:** Mueve tus notas entre proyectos o sácalas al listado global arrastrándolas directamente en la barra lateral.
- 🗄️ **Múltiples Bóvedas (Repositorios):** Crea y administra múltiples repositorios independientes en local o en la nube y alterna entre ellos con un solo clic.
- ☁️ **Sincronización Directa con PostgreSQL/Supabase:** Conecta tus notas directamente a tu base de datos relacional externa con creación automática de tablas y consultas seguras parametrizadas.
- 📌 **Notas Flotantes (Picture-in-Picture):** Fija cualquier nota al frente en una ventana flotante sin bordes. Ahora con **soporte de edición y sincronización automática en tiempo real** hacia la ventana principal.
- 🔒 **Seguridad AES-256:** Cifra localmente tus archivos de notas y tareas con protección por contraseña.

---

### 🛠️ Requisitos Previos

Asegúrate de tener instalado en tu sistema:
- **Node.js** (versión 18.0 o superior recomendada)
- **NPM** (incluido con Node.js)

---

### 🚀 Cómo Ejecutar el Proyecto

Sigue estos sencillos pasos para poner en marcha NOTEAL en modo de desarrollo:

1. **Clonar el repositorio e ingresar a la carpeta**
   ```bash
   git clone <url-del-repositorio>
   cd noteal
   ```

2. **Instalar las dependencias**
   ```bash
   npm install
   ```

3. **Iniciar la aplicación**
   ```bash
   npm start
   ```

---

### 📦 Cómo Empaquetar / Crear el Ejecutable (.exe)

NOTEAL está preparado para empaquetarse de manera sencilla para sistemas operativos Windows (x64):

#### Re-generar Iconos (Opcional)
Si modificas la imagen PNG de la marca (`src/assets/icon.png`), puedes generar automáticamente el icono nativo de Windows ejecutando:
```bash
node convert-icon.js
```

#### Empaquetar
Para compilar y empaquetar la aplicación en un paquete de producción libre de herramientas de desarrollo (DevTools) y optimizado:
```bash
npm run package
```
El instalable y ejecutable resultante se creará en el directorio:
📁 `dist/NOTEAL-win32-x64/`

---

### 📂 Estructura del Código

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

### 🤝 Cómo Aportar al Proyecto

¡Las contribuciones son bienvenidas y muy valoradas! Para colaborar con el proyecto, sigue estos pasos:

1. **Haz un Fork** del repositorio.
2. **Crea una nueva rama** para tu funcionalidad o corrección de error:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Realiza tus cambios** y asegúrate de mantener el estilo limpio del código.
4. **Hace commit** de tus modificaciones con mensajes claros y descriptivos:
   ```bash
   git commit -m "feat: agrega soporte para re-ordenar notas con drag and drop"
   ```
5. **Sube tu rama** al repositorio remoto:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
6. Abre un **Pull Request** detallando los cambios que has introducido y por qué son necesarios.

---

### 📝 Licencia

Este proyecto está bajo la licencia ISC. Creado originalmente por **Study Academy**.
