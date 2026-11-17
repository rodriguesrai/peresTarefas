@echo off
rem Copia o banco de dados para a pasta "backups".
cd /d "%~dp0"
set "PS_SCRIPT=%~dp0sistema\scripts\iniciar.ps1"
if not exist "%PS_SCRIPT%" set "PS_SCRIPT=%~dp0scripts\iniciar.ps1"
title Peres Tarefas - backup
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -Root "%~dp0." -Backup
