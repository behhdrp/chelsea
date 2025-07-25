
@echo off
echo Iniciando servidor local em http://localhost:8000 ...
cd /d "%~dp0"
start php -S localhost:8000
pause
