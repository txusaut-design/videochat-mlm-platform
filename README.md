Platform de video chat con sistema MLM y recompensas en USDC.

## Estado Actual
- ✅ Integración Frontend-Backend funcionando
- ✅ Registro y login de usuarios
- ✅ Estructura base de componentes UI
- ✅ Sistema de autenticación
- 🔄 Base de datos (en desarrollo)
- 🔄 Sistema MLM (en desarrollo)
- 🔄 Video chat con WebRTC (en desarrollo)

## Tecnologías
- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Express.js, TypeScript
- **Base de Datos**: PostgreSQL (pendiente)
- **Blockchain**: Polygon Network para pagos USDC

## Instalación

### Backend
```bash
cd backend
npm install
npm run dev
Frontend
bashcd frontend
npm install
npm run dev
URLs de Desarrollo

Frontend: http://localhost:3000
Backend: http://localhost:5001

Próximos Pasos

 Implementar base de datos PostgreSQL
 Sistema de autenticación JWT completo
 Funcionalidad de video chat con WebRTC
 Sistema MLM con comisiones automáticas
 Integración con Polygon para pagos USDC


### **4. Commit y push del README**
```bash
git add README.md
git commit -m "Add README with project documentation"
git push
Una vez ejecutes estos comandos, el proyecto estará disponible en:
https://github.com/txusaut-design/videochat-mlm-platform
¿Has podido crear el repositorio y hacer el push inicial?ReintentarCFcarlosfernandez@MacBook-Air-de-Carlos frontend % git remote add origin https://github.com/txusaut-design/videochat-mlm-platform.git
error: remote origin already exists.
carlosfernandez@MacBook-Air-de-Carlos frontend %EditarDiagnosed git remote issue and recommended root directory setup.The user is getting an error that the remote origin already exists. This means they already have a git repository set up in the frontend folder, but they're in the frontend folder, not the root of the project. They need to be in the root directory to set up the git repository for the entire project.
Let me guide them to fix this. They should either:

Remove the existing remote and add the new one
Or go to the root directory and set up git there properly

Since this seems to be about the entire project (both frontend and backend), they should be in the root directory, not the frontend directory.El error indica que ya existe un remote origin. Además, estás en la carpeta frontend, pero deberías estar en la carpeta raíz del proyecto para subir tanto frontend como backend.
Solución:
1. Ve a la carpeta raíz del proyecto
bashcd ..
pwd  # Verificar que estás en la carpeta que contiene tanto 'frontend' como 'backend'
ls   # Deberías ver: frontend/ backend/
2. Verificar el estado de Git
bashgit status
3a. Si NO hay repositorio Git en la raíz:
bashgit init
git add .
git commit -m "Initial commit: Frontend-Backend integration working"
git remote add origin https://github.com/txusaut-design/videochat-mlm-platform.git
git branch -M main
git push -u origin main
3b. Si SÍ hay repositorio Git pero con remote incorrecto:
bashgit remote -v  # Ver qué remote existe
git remote remove origin  # Remover el remote actual
git remote add origin https://github.com/txusaut-design/videochat-mlm-platform.git
git branch -M main
git push -u origin main
4. Estructura correcta del proyecto:
videochat-mlm-platform/
├── frontend/
├── backend/
├── README.md
├── .gitignore
└── .git/
🚀 Desarrollado por txusaut-design

