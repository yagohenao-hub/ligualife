@echo off
title LinguaLife Public Host (ngrok)
color 0a

echo ==================================================================
echo.
echo              LINGUALIFE 2.0 - PUBLIC HOSTING SCRIPT
echo.
echo ==================================================================
echo.

:: 1. Verificacion simple
echo [1/2] Verificando servidor local en puerto 3000...
netstat -ano | findstr :3000
echo.
echo Si ves una linea arriba, tu servidor esta ACTIVO. 
echo Si no ves nada, recuerda iniciar 'npm run dev' primero.
echo.

echo [2/2] Iniciando tunel publico con ngrok...
echo ==================================================================
echo.
echo RECUERDA:
echo 1. Busca el enlace que dice "Forwarding" (empieza con https://)
echo 2. ESE enlace es el que debes compartir con alumnos o profes.
echo 3. NO cierres esta ventana hasta que termine tu reunion.
echo.
echo ==================================================================
echo.

:: Inicia ngrok para el app principal
ngrok http 3000

if %errorlevel% neq 0 (
    echo.
    echo [!] ERROR: No se pudo iniciar ngrok. 
    echo Asegurate de tener instalado ngrok y que este en tu PATH.
)

echo.
echo Tunel cerrado. 
pause
