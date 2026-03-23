@echo off
setlocal
chcp 65001 >nul
title 夯拉榜 - 打包成可直接打开版

echo.
echo [1/3] 正在检查 Node.js / npm...
where npm >nul 2>nul
if errorlevel 1 (
  echo 未检测到 npm。
  echo 请先安装 Node.js： https://nodejs.org/
  echo 安装完成后，再双击这个文件即可。
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo.
  echo [2/3] 首次使用，正在安装依赖...
  call npm install
  if errorlevel 1 (
    echo.
    echo 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
) else (
  echo.
  echo [2/3] 已检测到依赖，跳过安装。
)

echo.
echo [3/3] 正在生成可直接打开的版本...
call npm run build
if errorlevel 1 (
  echo.
  echo 打包失败，请重试。
  pause
  exit /b 1
)

echo.
echo 打包完成。
echo 你可以把 dist 文件夹发给别人使用。
echo 别人双击 dist\index.html 就能直接打开。
echo.
start "" "%~dp0dist\index.html"
pause
