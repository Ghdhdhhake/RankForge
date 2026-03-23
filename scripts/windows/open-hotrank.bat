@echo off
setlocal
chcp 65001 >nul
title 夯拉榜

if exist "%~dp0dist\index.html" (
  start "" "%~dp0dist\index.html"
  exit /b 0
)

echo 当前还没有可直接打开的版本。
echo 请先双击“打包成可直接打开版.bat”。
echo.
pause
