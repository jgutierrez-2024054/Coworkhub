# Instrucciones de Despliegue en Render

## 1. Crear Base de Datos PostgreSQL en Render

1. Ve a [Render](https://render.com)
2. Haz clic en "New +" > "PostgreSQL"
3. Configura:
   - **Name**: `coworkhub-db`
   - **Region**: Oregon (US West) (o la misma región que tu Web Service)
   - **PostgreSQL Version**: 16
   - **Plan**: Free
4. Haz clic en "Create Database"

## 2. Crear Web Service en Render

1. En Render, haz clic en "New +" > "Web Service"
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name**: `coworkhub-api`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Runtime**: Node 18.x
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Haz clic en "Create Web Service"

## 3. Configurar Variables de Entorno

En tu Web Service, ve a "Environment Variables" y agrega:

**Variables de Base de Datos (obtenidas de tu base de datos Render):**
- `DB_HOST`: El host de tu base de datos Render
- `DB_PORT`: `5432`
- `DB_NAME`: El nombre de la base de datos
- `DB_USER`: El usuario de la base de datos
- `DB_PASSWORD`: El password de la base de datos

**Otras Variables:**
- `JWT_SECRET`: Un secreto largo y aleatorio para JWT
- `JWT_EXPIRES_IN`: `8h`
- `COOKIE_NAME`: `cwh_session`
- `CLIENT_ORIGIN`: La URL de tu frontend en producción
- `NODE_ENV`: `production`

## 4. Conectar Base de Datos al Web Service

1. Ve a tu Web Service
2. En la sección "Environment", busca "Databases"
3. Haz clic en "Add Database"
4. Selecciona tu base de datos `coworkhub-db`
5. Render configurará automáticamente las variables de conexión

## 5. Desplegar

1. Haz un redeploy manual: "Manual Deploy" > "Deploy latest commit"
2. Espera a que el despliegue termine
3. El servicio debería estar "Live"

## 6. Ejecutar Seed (Datos de Prueba)

1. Cuando el despliegue esté "Live", ve a la sección "Shell" de tu Web Service
2. Ejecuta: `npm run seed`
3. Esto creará los datos de prueba en la base de datos

## 7. Verificar

1. Ve a la URL de tu Web Service
2. Prueba la API: `https://tu-url-render.com/docs` (Swagger)
3. Verifica que los endpoints funcionen correctamente

## Troubleshooting

Si tienes problemas de conexión:
- Asegúrate de que la base de datos y el Web Service estén en la misma región
- Verifica que las variables de entorno estén configuradas correctamente
- Revisa los logs en el dashboard de Render

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
