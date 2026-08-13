@echo off
echo ============================================
echo   Iniciando Brunch ^& Co. (modo desarrollo)
echo ============================================

set ROOT=%~dp0

start "usuario-service"  cmd /k "cd /d %ROOT%usuario-service  && mvn spring-boot:run"
timeout /t 3 /nobreak >nul
start "menu-service"     cmd /k "cd /d %ROOT%menu-service     && mvn spring-boot:run"
timeout /t 3 /nobreak >nul
start "pedido-service"   cmd /k "cd /d %ROOT%pedido-service   && mvn spring-boot:run"
timeout /t 3 /nobreak >nul
start "reserva-service"  cmd /k "cd /d %ROOT%reserva-service  && mvn spring-boot:run"
timeout /t 3 /nobreak >nul
start "contacto-service" cmd /k "cd /d %ROOT%contacto-service && mvn spring-boot:run"

echo.
echo Todos los servicios backend iniciando...
echo Espera ~30 segundos a que aparezca "Started" en cada ventana.
echo.
timeout /t 30 /nobreak

start "frontend" cmd /k "cd /d %ROOT%brunchie_design && npm run dev"

echo.
echo Frontend iniciando en http://localhost:5173
echo.
pause
