@echo off
rem Abre o Peres Tarefas. Na primeira vez, prepara tudo sozinho.
cd /d "%~dp0"
set "PS_SCRIPT=%~dp0sistema\scripts\iniciar.ps1"
if not exist "%PS_SCRIPT%" set "PS_SCRIPT=%~dp0scripts\iniciar.ps1"
title Peres Tarefas - nao feche esta janela
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -Root "%~dp0."
if errorlevel 1 pause
