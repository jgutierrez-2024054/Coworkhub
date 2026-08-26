@echo off
echo ========================================
echo Iniciando CoworkHub con HTTPS (ngrok)
echo ========================================
echo.

echo [1/2] Iniciando servidor backend...
cd backend
start "CoworkHub Backend" cmd /k "npm start"
cd ..
echo Backend iniciado en http://localhost:4000
echo.

echo Esperando 5 segundos para que el backend inicie...
timeout /t 5 /nobreak > nul

echo [2/2] Iniciando ngrok para HTTPS...
echo La URL HTTPS aparecerá abajo. Copiala para usarla en iOS.
echo.
echo ========================================
ngrok http 4000
