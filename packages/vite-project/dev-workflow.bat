@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Shadow DOM 修复开发测试工作流程 - Windows 版本
echo 🔧 Shadow DOM 修复 - 开发测试工作流程
echo =======================================

REM 检查是否在正确目录
if not exist "..\..\package.json" (
    echo [ERROR] 请在 packages\vite-project 目录下运行此脚本
    pause
    exit /b 1
)

if not exist "..\..\packages\components" (
    echo [ERROR] 未找到 components 包目录
    pause
    exit /b 1
)

REM 处理命令行参数
if "%1"=="build" goto full_build
if "%1"=="quick" goto quick_rebuild
if "%1"=="dev" goto start_dev

:menu
echo.
echo 选择操作：
echo 1. 完整构建和测试流程
echo 2. 快速重新构建（修改后）
echo 3. 只启动开发服务器
echo 4. 检查构建状态
echo 5. 清理所有缓存
echo 0. 退出
echo.
set /p choice="请输入选项 (0-5): "

if "%choice%"=="1" goto full_build
if "%choice%"=="2" goto quick_rebuild
if "%choice%"=="3" goto start_dev
if "%choice%"=="4" goto check_status
if "%choice%"=="5" goto clean_all
if "%choice%"=="0" goto exit
echo [ERROR] 无效选项，请重新选择
goto menu

:full_build
echo [INFO] 开始完整构建流程...
call :build_components
if errorlevel 1 goto error
call :check_build_output
if errorlevel 1 goto error
call :update_dependencies
if errorlevel 1 goto error
call :start_dev_server
goto menu

:quick_rebuild
echo [INFO] 执行快速重新构建...
cd ..\..
echo [INFO] 重新构建 components...
call pnpm -F @opentiny/tiny-robot build
if errorlevel 1 (
    echo [ERROR] 快速构建失败
    cd packages\vite-project
    goto error
)
cd packages\vite-project
echo [SUCCESS] ✨ 快速重新构建完成！刷新浏览器查看更新
pause
goto menu

:start_dev
echo [INFO] 启动开发服务器...
echo.
echo [SUCCESS] 🚀 开发服务器启动中...
echo 📍 访问地址: http://localhost:5173
echo 🔍 打开开发者工具进行测试
echo 💡 在控制台输入: ShadowDOMDebugger.runFullCheck()
echo.
echo [WARNING] 按 Ctrl+C 停止服务器
echo.
call npm run dev
goto menu

:check_status
echo [INFO] 检查构建状态...
echo.
echo Components 构建状态：
if exist "..\..\packages\components\dist" (
    echo [SUCCESS] ✓ 构建产物存在
    echo   文件列表：
    dir "..\..\packages\components\dist" /b
) else (
    echo [WARNING] ✗ 构建产物不存在
)

echo.
echo 依赖状态：
if exist "node_modules\@opentiny\tiny-robot" (
    echo [SUCCESS] ✓ 依赖已安装
) else (
    echo [WARNING] ✗ 依赖未安装
)
pause
goto menu

:clean_all
echo [INFO] 清理所有缓存...

if exist "..\..\packages\components\dist" (
    rmdir /s /q "..\..\packages\components\dist"
    echo [SUCCESS] 清理 components 构建产物
)

if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo [SUCCESS] 清理 vite-project node_modules
)

if exist "..\..\packages\components\node_modules" (
    rmdir /s /q "..\..\packages\components\node_modules"
    echo [SUCCESS] 清理 components node_modules
)

echo [SUCCESS] 所有缓存已清理
pause
goto menu

:build_components
echo [INFO] 开始构建 components 包...
cd ..\..

if exist "packages\components\dist" (
    echo [INFO] 清理之前的构建文件...
    rmdir /s /q "packages\components\dist"
)

echo [INFO] 执行构建命令...
call pnpm build:components
if errorlevel 1 (
    echo [ERROR] Components 包构建失败
    cd packages\vite-project
    exit /b 1
)

echo [SUCCESS] Components 包构建完成
cd packages\vite-project
exit /b 0

:check_build_output
echo [INFO] 检查构建输出...

if not exist "..\..\packages\components\dist" (
    echo [ERROR] 构建输出目录不存在
    exit /b 1
)

if not exist "..\..\packages\components\dist\index.js" (
    echo [ERROR] 主要构建文件不存在
    exit /b 1
)

echo [SUCCESS] 构建输出检查通过
echo 构建文件列表：
dir "..\..\packages\components\dist" /b
exit /b 0

:update_dependencies
echo [INFO] 更新 vite-project 依赖...

if exist "node_modules\@opentiny" (
    echo [INFO] 清理依赖缓存...
    rmdir /s /q "node_modules\@opentiny"
)

echo [INFO] 重新安装依赖...
call pnpm install
if errorlevel 1 (
    echo [ERROR] 依赖更新失败
    exit /b 1
)

echo [SUCCESS] 依赖更新完成
exit /b 0

:start_dev_server
echo [INFO] 启动开发服务器...
echo.
echo [SUCCESS] 🚀 开发服务器启动中...
echo 📍 访问地址: http://localhost:5173
echo 🔍 打开开发者工具进行测试
echo 💡 在控制台输入: ShadowDOMDebugger.runFullCheck()
echo.
echo [WARNING] 按 Ctrl+C 停止服务器
echo.
call npm run dev
exit /b 0

:error
echo [ERROR] 操作失败
pause
goto menu

:exit
echo [SUCCESS] 再见！
pause
exit /b 0