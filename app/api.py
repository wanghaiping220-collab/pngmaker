"""
FastAPI Server for PNG Generator
Provides REST API endpoints for n8n and other workflow tools
"""
import os
import json
import base64
from io import BytesIO
from typing import Optional, List
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Body, Request
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .models import (
    ImageConfig, BatchConfig, BatchTextReplaceConfig,
    GenerateResponse, HealthResponse, CanvasConfig, TitleConfig, TextConfig,
    StrokeConfig, ShadowConfig, BackgroundBlockConfig
)
from .generator import PNGGenerator
from . import __version__

# 初始化应用
app = FastAPI(
    title="PNG Batch Generator API",
    description="批量生成PNG透明底图片的API服务，支持自定义文字、字体、颜色、描边、阴影、背景色块等",
    version=__version__,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 添加 CORS 中间件，允许 n8n 等外部工具调用
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局生成器实例
generator = PNGGenerator()

# 默认输出目录
DEFAULT_OUTPUT_DIR = str(Path(__file__).parent.parent / "output")

# 静态文件目录
STATIC_DIR = Path(__file__).parent.parent / "static"

# 挂载静态文件（放在API路由定义之后）
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    """
    服务前端界面
    """
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path), media_type="text/html")
    else:
        return HTMLResponse(content="""
        <html>
            <head><title>PNG Generator</title></head>
            <body>
                <h1>PNG Batch Generator API</h1>
                <p>前端文件未找到，请访问 <a href="/docs">/docs</a> 查看API文档</p>
            </body>
        </html>
        """)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查端点"""
    return HealthResponse(status="healthy", version=__version__)


@app.post("/generate", response_model=GenerateResponse)
async def generate_image(config: ImageConfig, output_dir: Optional[str] = None):
    """
    生成单张PNG图片

    - **config**: 完整的图片配置
    - **output_dir**: 可选的输出目录
    """
    try:
        out_dir = output_dir or DEFAULT_OUTPUT_DIR
        output_path = generator.generate(config, out_dir)
        return GenerateResponse(
            success=True,
            message="图片生成成功",
            output_path=output_path
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/base64")
async def generate_image_base64(config: ImageConfig):
    """
    生成PNG图片并返回Base64编码

    适合直接在API响应中获取图片数据
    """
    try:
        from PIL import Image
        import tempfile

        # 生成到临时目录
        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = generator.generate(config, temp_dir)

            # 读取并转换为 base64
            with open(output_path, "rb") as f:
                image_data = f.read()
                base64_data = base64.b64encode(image_data).decode("utf-8")

        return JSONResponse({
            "success": True,
            "message": "图片生成成功",
            "image_base64": base64_data,
            "mime_type": "image/png"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/download")
async def generate_and_download(config: ImageConfig):
    """
    生成PNG图片并直接下载

    返回图片文件流
    """
    try:
        import tempfile

        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = generator.generate(config, temp_dir)

            # 读取文件内容
            with open(output_path, "rb") as f:
                image_data = f.read()

        # 返回文件流
        return StreamingResponse(
            BytesIO(image_data),
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename={config.output_filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/batch", response_model=GenerateResponse)
async def generate_batch(batch_config: BatchConfig):
    """
    批量生成多张PNG图片

    - **batch_config.images**: 图片配置列表
    - **batch_config.output_dir**: 输出目录
    """
    try:
        out_dir = batch_config.output_dir or DEFAULT_OUTPUT_DIR
        output_paths = generator.generate_batch(batch_config.images, out_dir)
        return GenerateResponse(
            success=True,
            message=f"成功生成 {len(output_paths)} 张图片",
            output_paths=output_paths
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/batch/template", response_model=GenerateResponse)
async def generate_batch_from_template(template_config: BatchTextReplaceConfig):
    """
    使用模板批量生成图片

    通过模板和替换内容列表快速生成多张相似的图片

    示例替换格式:
    ```json
    {
        "template": { ... },
        "replacements": [
            {
                "title_primary.text": "新标题1",
                "title_secondary.text": "新副标题1",
                "output_filename": "image_001.png"
            },
            {
                "title_primary.text": "新标题2",
                "title_secondary.text": "新副标题2",
                "output_filename": "image_002.png"
            }
        ]
    }
    ```
    """
    try:
        output_paths = []
        out_dir = template_config.output_dir or DEFAULT_OUTPUT_DIR

        for i, replacement in enumerate(template_config.replacements):
            # 深拷贝模板配置
            config_dict = template_config.template.model_dump()

            # 应用替换
            for key, value in replacement.items():
                _set_nested_value(config_dict, key, value)

            # 设置默认文件名
            if "output_filename" not in replacement:
                config_dict["output_filename"] = f"{template_config.filename_prefix}{i:04d}.png"

            # 生成图片
            config = ImageConfig(**config_dict)
            path = generator.generate(config, out_dir)
            output_paths.append(path)

        return GenerateResponse(
            success=True,
            message=f"成功生成 {len(output_paths)} 张图片",
            output_paths=output_paths
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _set_nested_value(d: dict, key: str, value):
    """设置嵌套字典的值，支持点号分隔的键"""
    keys = key.split(".")
    for k in keys[:-1]:
        if k not in d:
            d[k] = {}
        d = d[k]
    d[keys[-1]] = value


@app.post("/generate/simple")
async def generate_simple(
    # 画布配置
    width: int = Query(default=1080, description="画布宽度"),
    height: int = Query(default=1920, description="画布高度"),
    background_color: Optional[str] = Query(default=None, description="背景颜色，None为透明"),

    # 一级标题
    title_primary_text: Optional[str] = Query(default=None, description="一级标题文字"),
    title_primary_color: str = Query(default="#FF6600", description="一级标题颜色"),
    title_primary_size: int = Query(default=72, description="一级标题字号"),
    title_primary_y: int = Query(default=100, description="一级标题Y坐标"),
    title_primary_font: str = Query(default="default", description="一级标题字体"),

    # 二级标题
    title_secondary_text: Optional[str] = Query(default=None, description="二级标题文字"),
    title_secondary_color: str = Query(default="#1E90FF", description="二级标题颜色"),
    title_secondary_size: int = Query(default=56, description="二级标题字号"),
    title_secondary_y: int = Query(default=200, description="二级标题Y坐标"),
    title_secondary_font: str = Query(default="default", description="二级标题字体"),

    # 三级标题（可选）
    title_tertiary_text: Optional[str] = Query(default=None, description="三级标题文字"),
    title_tertiary_color: str = Query(default="#1E90FF", description="三级标题颜色"),
    title_tertiary_size: int = Query(default=48, description="三级标题字号"),
    title_tertiary_y: int = Query(default=280, description="三级标题Y坐标"),
    title_tertiary_font: str = Query(default="default", description="三级标题字体"),

    # 正文
    body_text: Optional[str] = Query(default=None, description="正文内容"),
    body_color: str = Query(default="#FF6600", description="正文颜色"),
    body_size: int = Query(default=42, description="正文字号"),
    body_y: int = Query(default=1400, description="正文Y坐标"),
    body_font: str = Query(default="default", description="正文字体"),

    # 输出配置
    output_filename: str = Query(default="output.png", description="输出文件名"),
    return_base64: bool = Query(default=False, description="是否返回Base64")
):
    """
    简化的图片生成接口

    适合通过 URL 参数快速调用，无需构建复杂的 JSON 配置
    """
    try:
        # 构建配置
        config = ImageConfig(
            canvas=CanvasConfig(
                width=width,
                height=height,
                background_color=background_color
            ),
            output_filename=output_filename
        )

        # 添加一级标题
        if title_primary_text:
            config.title_primary = TitleConfig(
                text=title_primary_text,
                color=title_primary_color,
                font_size=title_primary_size,
                position_y=title_primary_y,
                font_family=title_primary_font,
                font_weight="bold"
            )

        # 添加二级标题
        if title_secondary_text:
            config.title_secondary = TitleConfig(
                text=title_secondary_text,
                color=title_secondary_color,
                font_size=title_secondary_size,
                position_y=title_secondary_y,
                font_family=title_secondary_font,
                italic=True
            )

        # 添加三级标题
        if title_tertiary_text:
            config.title_tertiary = TitleConfig(
                text=title_tertiary_text,
                color=title_tertiary_color,
                font_size=title_tertiary_size,
                position_y=title_tertiary_y,
                font_family=title_tertiary_font,
                italic=True
            )

        # 添加正文
        if body_text:
            config.body_text = TextConfig(
                text=body_text,
                color=body_color,
                font_size=body_size,
                position_y=body_y,
                font_family=body_font,
                italic=True
            )

        if return_base64:
            # 返回 Base64
            import tempfile
            with tempfile.TemporaryDirectory() as temp_dir:
                output_path = generator.generate(config, temp_dir)
                with open(output_path, "rb") as f:
                    image_data = f.read()
                    base64_data = base64.b64encode(image_data).decode("utf-8")

            return JSONResponse({
                "success": True,
                "image_base64": base64_data,
                "mime_type": "image/png"
            })
        else:
            # 返回文件
            import tempfile
            with tempfile.TemporaryDirectory() as temp_dir:
                output_path = generator.generate(config, temp_dir)
                with open(output_path, "rb") as f:
                    image_data = f.read()

            return StreamingResponse(
                BytesIO(image_data),
                media_type="image/png",
                headers={
                    "Content-Disposition": f"attachment; filename={output_filename}"
                }
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/fonts")
async def list_fonts():
    """
    列出可用的字体

    返回系统中检测到的可用字体列表
    """
    from .generator import FontManager
    fm = FontManager()

    available_fonts = []
    for font_name in fm.CHINESE_FONTS.keys():
        path = fm._find_font_file(font_name)
        if path:
            available_fonts.append({
                "name": font_name,
                "path": path
            })

    return JSONResponse({
        "available_fonts": available_fonts,
        "custom_font_dir": fm.custom_font_dir
    })


@app.get("/example/config")
async def get_example_config():
    """
    获取示例配置

    返回一个完整的图片配置示例
    """
    example = ImageConfig(
        canvas=CanvasConfig(
            width=1080,
            height=1920,
            background_color=None  # 透明背景
        ),
        title_primary=TitleConfig(
            text="小鹏P7+挑战多米诺车位",
            font_family="msyh",
            font_size=64,
            font_weight="bold",
            color="#FF6600",
            position_y=100,
            align="center",
            stroke=StrokeConfig(enabled=False),
            shadow=ShadowConfig(enabled=False)
        ),
        title_secondary=TitleConfig(
            text="从一穷二白到反客为主\n只用了几十年",
            font_family="msyh",
            font_size=52,
            font_weight="bold",
            color="#1E90FF",
            position_y=200,
            align="center",
            italic=True
        ),
        body_text=TextConfig(
            text="以前觉得这种高科技离我们很远，\n现在看着老外惊叹的表情，\n才发现轻舟已过万重山了。",
            font_family="msyh",
            font_size=42,
            color="#FF6600",
            position_y=1400,
            align="center",
            italic=True,
            background_block=BackgroundBlockConfig(
                enabled=False
            )
        ),
        output_filename="example_output.png"
    )

    return JSONResponse(example.model_dump())


@app.get("/example/batch")
async def get_batch_example():
    """
    获取批量生成示例配置
    """
    example = {
        "template": {
            "canvas": {
                "width": 1080,
                "height": 1920,
                "background_color": None
            },
            "title_primary": {
                "text": "{{title}}",
                "font_family": "msyh",
                "font_size": 64,
                "font_weight": "bold",
                "color": "#FF6600",
                "position_y": 100,
                "align": "center"
            },
            "title_secondary": {
                "text": "{{subtitle}}",
                "font_family": "msyh",
                "font_size": 52,
                "color": "#1E90FF",
                "position_y": 200,
                "align": "center"
            },
            "output_filename": "output.png"
        },
        "replacements": [
            {
                "title_primary.text": "第一张图片标题",
                "title_secondary.text": "第一张图片副标题",
                "output_filename": "image_001.png"
            },
            {
                "title_primary.text": "第二张图片标题",
                "title_secondary.text": "第二张图片副标题",
                "output_filename": "image_002.png"
            }
        ],
        "output_dir": "output",
        "filename_prefix": "batch_"
    }

    return JSONResponse(example)


@app.get("/files/{filename}")
async def get_file(filename: str):
    """
    获取已生成的图片文件
    """
    file_path = os.path.join(DEFAULT_OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")

    return FileResponse(file_path, media_type="image/png")


@app.get("/files")
async def list_files():
    """
    列出所有已生成的图片文件
    """
    if not os.path.exists(DEFAULT_OUTPUT_DIR):
        return JSONResponse({"files": []})

    files = [f for f in os.listdir(DEFAULT_OUTPUT_DIR) if f.endswith(".png")]
    return JSONResponse({"files": files, "output_dir": DEFAULT_OUTPUT_DIR})
