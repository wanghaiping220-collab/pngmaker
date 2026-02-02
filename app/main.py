"""
PNG Batch Generator - Main Entry Point
"""
import argparse
import uvicorn


def main():
    """主入口函数"""
    parser = argparse.ArgumentParser(
        description="PNG Batch Generator - 批量生成PNG透明底图片"
    )
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="API服务监听地址 (默认: 0.0.0.0)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="API服务端口 (默认: 8000)"
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        help="启用热重载（开发模式）"
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="工作进程数 (默认: 1)"
    )

    args = parser.parse_args()

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║          PNG Batch Generator API Server                      ║
╠══════════════════════════════════════════════════════════════╣
║  API文档: http://{args.host}:{args.port}/docs                        ║
║  健康检查: http://{args.host}:{args.port}/health                     ║
║  示例配置: http://{args.host}:{args.port}/example/config             ║
╚══════════════════════════════════════════════════════════════╝
    """)

    uvicorn.run(
        "app.api:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=args.workers if not args.reload else 1
    )


if __name__ == "__main__":
    main()
