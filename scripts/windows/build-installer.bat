@echo off
setlocal
chcp 65001 >nul
title 夯拉榜 - 打包安装版 EXE

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
echo [3/3] 正在生成安装版 EXE...
call npm run dist:win
if errorlevel 1 (
  echo.
  echo 打包失败，请重试。
  pause
  exit /b 1
)

echo.
echo 打包完成。
echo 安装程序在 release 文件夹里。
echo 你可以把里面的 exe 发给别人安装使用。
echo.
start "" "%~dp0release"
pause
