@echo off
echo Iniciando microservicios...

start "usuario-service" cmd /k "cd usuario-service && mvn spring-boot:run"
start "menu-service"    cmd /k "cd menu-service    && mvn spring-boot:run"
start "pedido-service"  cmd /k "cd pedido-service  && mvn spring-boot:run"
start "reserva-service" cmd /k "cd reserva-service && mvn spring-boot:run"
start "contacto-service" cmd /k "cd contacto-service && mvn spring-boot:run"

echo Servicios iniciando en ventanas separadas.
echo Espera a que todos muestren "Started" antes de correr el frontend.
pause
