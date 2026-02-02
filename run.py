#!/usr/bin/env python
"""
便捷启动脚本
"""
import sys
import os

# 确保可以导入 app 模块
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import main

if __name__ == "__main__":
    main()
