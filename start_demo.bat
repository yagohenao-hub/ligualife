@echo off
title LinguaLife Demo Online
color 0b

echo ==================================================================
echo.
echo               INICIANDO LINGUALIFE DEMO ONLINE
echo.
echo ==================================================================
echo.
echo [1/2] Iniciando el servidor local...
:: Inicia el servidor de Python en una ventana oculta/minimizada
start /min cmd /c "cd dashboard && py -m http.server 8080"
timeout /t 2 /nobreak >nul
echo       Servidor iniciado correctamente en el puerto 8080.
echo.

echo [2/2] Creando el enlace publico seguro...
echo.
echo ==================================================================
echo IMPORTANTE: 
echo Busca en la tabla inferior bajo el campo "Forwarding".
echo Tu URL publica inicia con "https://" y termina en ".ngrok-free.app"
echo Copia ese enlace: ESE ES TU LINK PARA LA REUNION!
echo.
echo *** NO CIERRES ESTA VENTANA NEGRA HASTA QUE TERMINE TU REUNION ***
echo ==================================================================
echo.

:: Inicia el tunel de ngrok
ngrok http 8080

echo.
echo El tunel se ha desconectado.
pause
