# Instrucciones de Despliegue en Render

## Despliegue en Render

Render es una plataforma más adecuada para aplicaciones Node.js/Express tradicionales que sirven tanto API como archivos estáticos.

### Paso 1: Crear cuenta en Render
1. Ve a https://render.com
2. Crea una cuenta o inicia sesión con GitHub

### Paso 2: Conectar repositorio
1. En el dashboard de Render, haz clic en "New +" > "Web Service"
2. Conecta tu repositorio de GitHub (o sube el código a GitHub primero)
3. Si no usas Git, puedes usar la opción "Deploy from Git"

### Paso 3: Configurar el Web Service

**Configuración básica:**
- **Name**: `coworkhub`
- **Region**: Selecciona la región más cercana a tus usuarios
- **Branch**: `main` (o tu rama principal)

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Environment Variables:**
Agrega estas variables en la sección "Environment Variables":

```
NODE_ENV=production
PORT=4000
DB_HOST=ep-dark-dust-ayj43bxy-pooler.c-5.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=npg_fuQVA7Nzi1yY
JWT_SECRET=Admin123COW
JWT_EXPIRES_IN=8h
COOKIE_NAME=cwh_session
CLIENT_ORIGIN=https://tu-url-render.onrender.com
```

**Nota importante:** Después del primer despliegue, Render te dará una URL. Actualiza `CLIENT_ORIGIN` con esa URL y haz un redeploy.

### Paso 4: Desplegar
1. Haz clic en "Create Web Service"
2. Render construirá y desplegará tu aplicación
3. Espera a que el estado sea "Live"

### Paso 5: Ejecutar seed de datos
Después del despliegue, necesitas ejecutar el seed para poblar la base de datos:

1. Ve a la sección "Shell" en Render (en tu web service)
2. Ejecuta: `npm run seed`
3. Esto creará el usuario admin, planes, espacios y reservas de prueba

### Paso 6: Verificar despliegue
1. Abre la URL de tu aplicación (ej: https://coworkhub.onrender.com)
2. Prueba iniciar sesión con:
   - Email: `admin@coworkhub.test`
   - Contraseña: `Admin1234!`

### Variables de entorno requeridas
- `NODE_ENV`: `production`
- `PORT`: `4000`
- `DB_HOST`: Host de tu base de datos Neon
- `DB_PORT`: `5432`
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `JWT_SECRET`: Secreto para tokens JWT
- `JWT_EXPIRES_IN`: `8h`
- `COOKIE_NAME`: `cwh_session`
- `CLIENT_ORIGIN`: URL de tu aplicación en Render

### Diferencias con Vercel
- Render usa servidores tradicionales (no serverless)
- No requiere configuración especial de rutas
- Es más simple para aplicaciones Express que sirven archivos estáticos
- Tiene un plan gratuito generoso con límites de tiempo de inactividad

### Troubleshooting
- Si la aplicación no inicia, verifica los logs en Render
- Asegúrate de que todas las variables de entorno estén configuradas
- Verifica que la base de datos Neon sea accesible desde Render
- El seed debe ejecutarse manualmente desde la Shell de Render

### Actualizar CLIENT_ORIGIN después del despliegue
Render te asignará una URL automáticamente después del primer despliegue. Debes:
1. Copiar la URL asignada (ej: https://coworkhub-abc123.onrender.com)
2. Actualizar la variable `CLIENT_ORIGIN` en Render con esa URL
3. Hacer un redeploy manual desde el dashboard de Render
