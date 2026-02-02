@echo off
REM PNG Batch Generator 启动脚本 (Windows)
REM 使用方法: 双击运行或在命令行执行 run.bat

echo ========================================
echo   PNG Batch Generator 启动中...
echo ========================================

REM 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 检查依赖是否安装
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo [提示] 正在安装依赖...
    pip install -r requirements.txt
)

REM 启动服务
echo [提示] 服务启动中，请访问 http://localhost:8000/docs 查看API文档
python run.py --host 0.0.0.0 --port 8000

pause
