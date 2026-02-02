#!/bin/bash
# PNG Batch Generator 启动脚本 (Linux/macOS)

echo "========================================"
echo "  PNG Batch Generator 启动中..."
echo "========================================"

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到 Python3，请先安装 Python 3.8+"
    exit 1
fi

# 检查依赖是否安装
if ! python3 -c "import fastapi" &> /dev/null; then
    echo "[提示] 正在安装依赖..."
    pip3 install -r requirements.txt
fi

# 启动服务
echo "[提示] 服务启动中，请访问 http://localhost:8000/docs 查看API文档"
python3 run.py --host 0.0.0.0 --port 8000
