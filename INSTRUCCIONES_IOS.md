# Instrucciones para instalar CoworkHub como PWA en iOS

## Requisitos previos

1. **Ngrok instalado** (para HTTPS temporal):
   - Descarga desde: https://ngrok.com/download
   - Instala y autentica: `ngrok config add-authtoken TU_TOKEN`
   - Obtén tu token en: https://dashboard.ngrok.com/get-started/your-authtoken

## Pasos para instalación en iOS

### 1. Iniciar el servidor con HTTPS

Ejecuta el script `start-ngrok.bat` en el directorio raíz del proyecto:

```bash
start-ngrok.bat
```

Esto iniciará:
- El servidor backend en http://localhost:4000
- Ngrok que creará una URL HTTPS pública

### 2. Obtener la URL HTTPS

Ngrok mostrará una URL como:
```
Forwarding https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:4000
```

Usa esta URL HTTPS (ejemplo: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`)

### 3. Instalar en iOS (iPhone/iPad)

1. **Abre Safari** en tu dispositivo iOS
2. **Navega a la URL HTTPS** de ngrok
3. **Toca el botón "Compartir"** (icono de cuadrado con flecha hacia arriba)
4. **Desliza hacia abajo** y selecciona "Agregar a inicio"
5. **Toca "Agregar"** en la confirmación
6. La app aparecerá en tu pantalla de inicio como una app nativa

### 4. Probar funcionalidad offline

1. **Abre la app** desde tu pantalla de inicio
2. **Desconecta WiFi** y datos móviles
3. **Navega entre páginas** - el shell y "Mis reservas" deberían cargar
4. **Reconecta** para usar las funciones que requieren API

## Características iOS implementadas

✅ **Meta tags específicos para iOS:**
- `apple-mobile-web-app-capable` - Se ejecuta como app nativa
- `apple-mobile-web-app-status-bar-style` - Barra de estado translúcida
- `apple-mobile-web-app-title` - Nombre de la app
- `apple-touch-icon` - Iconos para diferentes tamaños

✅ **Manifest optimizado:**
- `orientation: portrait` - Solo orientación vertical
- `scope: /` - Ámbito de la aplicación
- `purpose: any maskable` - Iconos adaptables
- `categories: business, productivity` - Categorías de la app

✅ **Service Worker mejorado:**
- Cache del shell completo
- Estrategia Cache First para assets estáticos
- Fallback inteligente para errores de red
- Logs para debugging

## Solución de problemas

### La app no se instala
- Asegúrate de usar **Safari** (no Chrome ni otros navegadores)
- Verifica que la URL sea **HTTPS**
- Limpia el cache de Safari: Ajustes > Safari > Borrar historial y datos

### Los iconos no aparecen
- Verifica que los archivos `icon-192.png` y `icon-512.png` existan en `frontend/icons/`
- Los iconos deben ser PNG con fondo transparente

### Offline no funciona
- Abre Safari DevTools en tu Mac conectado al iOS device
- Ve a Application > Service Workers y verifica que esté activo
- Verifica en Application > Cache Storage que los archivos estén cacheados

### Ngrok no funciona
- Verifica que ngrok esté instalado correctamente
- Autentica con tu token: `ngrok config add-authtoken TU_TOKEN`
- Asegúrate de que el puerto 4000 esté libre

## Alternativa: Hosting permanente

Para una solución permanente sin ngrok, considera:
- **Vercel/Netlify** - Hosting gratuito con HTTPS
- **Railway/Render** - Hosting para backend + frontend
- **GitHub Pages** - Solo para frontend estático

## Datos de prueba para demostración

**Admin:**
- Email: admin@coworkhub.test
- Contraseña: Admin1234!

**Miembros:**
- Email: ana@coworkhub.test
- Contraseña: Miembro1234!
- Email: carlos@coworkhub.test
- Contraseña: Miembro1234!
