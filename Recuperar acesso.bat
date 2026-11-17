@echo off
rem Gera uma senha provisoria para quem esqueceu a senha (inclusive o gestor).
cd /d "%~dp0"
set "PS_SCRIPT=%~dp0sistema\scripts\iniciar.ps1"
if not exist "%PS_SCRIPT%" set "PS_SCRIPT=%~dp0scripts\iniciar.ps1"
title Peres Tarefas - recuperar acesso
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -Root "%~dp0." -Recuperar
