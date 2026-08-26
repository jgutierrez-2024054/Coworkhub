# Instrucciones de Despliegue en Vercel

## 1. Preparación del Proyecto

El proyecto ya está configurado para Vercel con:
- `vercel.json` - Configuración de despliegue (usa pnpm)
- `.npmrc` - Configuración de pnpm
- `package.json` - Dependencias y scripts
- `backend/src/server.js` - Exporta la app Express para Vercel
- `backend/.env.production` - Variables de entorno de ejemplo

### Instalación de dependencias con pnpm
```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm

# Instalar dependencias
pnpm install
```

## 2. Configuración de Base de Datos

Para producción necesitas una base de datos PostgreSQL. Opciones recomendadas:

### Opción A: Supabase (Gratis)
1. Ve a https://supabase.com
2. Crea un proyecto nuevo
3. Ve a Settings > Database
4. Copia los datos de conexión:
   - Host
   - Database name
   - Username
   - Password
   - Port (usualmente 5432)

### Opción B: Neon (Gratis)
1. Ve a https://neon.tech
2. Crea un proyecto nuevo
3. Copia la cadena de conexión

### Opción C: Railway (Pago)
1. Ve a https://railway.app
2. Crea un nuevo proyecto PostgreSQL
3. Copia los datos de conexión

## 3. Despliegue en Vercel

### Paso 1: Instalar Vercel CLI
```bash
pnpm add -g vercel
```

### Paso 2: Iniciar sesión en Vercel
```bash
vercel login
```

### Paso 3: Desplegar el proyecto
```bash
cd c:/Users/CompuFire/Documents/Proyectos__Practicas/coworkhub
vercel
```

Sigue las instrucciones:
- **Set up and deploy**: `Y`
- **Link to existing project**: `N` (para crear uno nuevo)
- **Project name**: `coworkhub` (o el nombre que prefieras)
- **Directory**: `.` (directorio actual)
- **Override settings**: `N`

### Paso 4: Configurar Variables de Entorno

En el dashboard de Vercel (https://vercel.com/dashboard):

1. Ve a tu proyecto `coworkhub`
2. Settings > Environment Variables
3. Agrega las siguientes variables:

```
NODE_ENV=production
PORT=4000
DB_HOST=tu_db_host
DB_PORT=5432
DB_NAME=tu_db_name
DB_USER=tu_db_user
DB_PASSWORD=tu_db_password
JWT_SECRET=tu_secreto_largo_y_aleatorio
JWT_EXPIRES_IN=8h
COOKIE_NAME=cwh_session
CLIENT_ORIGIN=https://tu-proyecto.vercel.app
```

**IMPORTANTE**: Cambia `CLIENT_ORIGIN` por la URL real de tu proyecto en Vercel.

### Paso 5: Ejecutar Seed de Datos

Después del despliegue, necesitas poblar la base de datos:

1. En Vercel, ve a tu proyecto
2. Settings > Functions
3. Agrega una nueva función o usa la consola de Vercel
4. Ejecuta el seed: `node backend/src/seed.js`

O hazlo desde tu máquina local con las variables de entorno de producción:

```bash
cd backend
# Copia las variables de entorno de Vercel a un archivo .env.local
node src/seed.js
```

## 6. Verificar Despliegue

1. Abre la URL de Vercel: `https://tu-proyecto.vercel.app`
2. Prueba iniciar sesión con:
   - Email: `admin@coworkhub.test`
   - Contraseña: `Admin1234!`
3. Verifica que todas las funcionalidades funcionen

## 7. Dominio Personalizado (Opcional)

Para usar tu propio dominio:

1. En Vercel, ve a Settings > Domains
2. Agrega tu dominio
3. Configura los DNS según las instrucciones de Vercel
4. Actualiza `CLIENT_ORIGIN` con tu dominio personalizado

## 8. Solución de Problemas

### Error de conexión a base de datos
- Verifica que las variables de entorno estén correctas
- Asegúrate de que la base de datos permita conexiones externas
- Verifica que el puerto sea el correcto (5432 para PostgreSQL)

### Error de CORS
- Verifica que `CLIENT_ORIGIN` incluya la URL de tu proyecto en Vercel
- Asegúrate de que el dominio esté en la lista de permitidos

### Service Worker no funciona
- Limpia el cache del navegador
- Verifica que `manifest.json` sea accesible
- Asegúrate de que los iconos existan en la ruta correcta

## 9. Comandos Útiles

```bash
# Instalar dependencias
pnpm install

# Desplegar en producción
vercel --prod

# Ver logs de despliegue
vercel logs

# Desplegar en preview
vercel

# Eliminar despliegue
vercel rm

# Ejecutar seed de datos
pnpm run seed
```

## 10. Estructura del Proyecto

```
coworkhub/
├── backend/
│   ├── src/
│   │   ├── server.js          # Exporta app Express
│   │   ├── app.js             # Configuración de Express
│   │   ├── models/            # Modelos Sequelize
│   │   ├── controllers/       # Controladores
│   │   ├── services/          # Lógica de negocio
│   │   ├── middlewares/       # Middlewares
│   │   └── routes/            # Rutas API
│   ├── .env                   # Variables locales
│   ├── .env.production       # Variables producción (ejemplo)
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── admin.html
│   ├── my-reservations.html
│   ├── my-plan.html
│   ├── select-plan.html
│   ├── js/
│   ├── css/
│   ├── img/
│   ├── icons/
│   ├── manifest.json
│   └── service-worker.js
├── vercel.json                # Configuración Vercel
└── package.json               # Dependencias raíz
```

## Notas Importantes

- El backend sirve los archivos estáticos del frontend
- El service worker está configurado para PWA
- Las cookies httpOnly se usan para la sesión
- El JWT se usa para autenticación
- CORS está configurado para permitir múltiples orígenes
