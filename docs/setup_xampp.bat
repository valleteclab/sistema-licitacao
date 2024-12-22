@echo off
echo Configurando ambiente XAMPP para o Sistema de Licitacao...
echo.

REM Verifica se está rodando como administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Este script precisa ser executado como Administrador!
    echo Clique com botao direito e selecione "Executar como administrador"
    pause
    exit /b 1
)

REM Define o caminho do XAMPP
set XAMPP_PATH=C:\xampp

REM Verifica se o XAMPP está instalado
if not exist "%XAMPP_PATH%" (
    echo XAMPP nao encontrado em %XAMPP_PATH%
    echo Por favor, instale o XAMPP primeiro
    pause
    exit /b 1
)

echo Parando servicos do XAMPP...
"%XAMPP_PATH%\xampp_stop.exe"
timeout /t 5

echo Copiando configuracoes do Virtual Host...
copy "httpd-vhosts.conf" "%XAMPP_PATH%\apache\conf\extra\httpd-vhosts.conf"

echo Verificando modulos do Apache...
powershell -Command "(Get-Content '%XAMPP_PATH%\apache\conf\httpd.conf') -replace '#LoadModule proxy_module', 'LoadModule proxy_module' | Set-Content '%XAMPP_PATH%\apache\conf\httpd.conf'"
powershell -Command "(Get-Content '%XAMPP_PATH%\apache\conf\httpd.conf') -replace '#LoadModule proxy_http_module', 'LoadModule proxy_http_module' | Set-Content '%XAMPP_PATH%\apache\conf\httpd.conf'"
powershell -Command "(Get-Content '%XAMPP_PATH%\apache\conf\httpd.conf') -replace '#LoadModule headers_module', 'LoadModule headers_module' | Set-Content '%XAMPP_PATH%\apache\conf\httpd.conf'"

echo Criando banco de dados...
echo CREATE DATABASE IF NOT EXISTS sistema_licitacao; > create_db.sql
"%XAMPP_PATH%\mysql\bin\mysql.exe" -u root < create_db.sql
del create_db.sql

echo Importando esquema do banco de dados...
"%XAMPP_PATH%\mysql\bin\mysql.exe" -u root sistema_licitacao < ..\backend\src\database\schema.sql

echo Configurando ambiente Node.js...
cd ..
cd backend
call npm install
cd ..
cd frontend
call npm install

echo Criando arquivo .env do backend...
(
echo PORT=3001
echo DB_HOST=localhost
echo DB_USER=root
echo DB_PASSWORD=
echo DB_NAME=sistema_licitacao
echo JWT_SECRET=sistema_licitacao_secret
) > ..\backend\.env

echo Criando arquivo .env do frontend...
(
echo REACT_APP_API_URL=http://localhost/api
) > .env

echo Iniciando servicos do XAMPP...
"%XAMPP_PATH%\xampp_start.exe"

echo.
echo Configuracao concluida!
echo.
echo Para iniciar o sistema:
echo 1. Abra dois terminais
echo 2. No primeiro terminal:
echo    cd backend
echo    npm run dev
echo 3. No segundo terminal:
echo    cd frontend
echo    npm start
echo.
echo O sistema estara disponivel em:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3001
echo phpMyAdmin: http://localhost/phpmyadmin
echo.

pause
