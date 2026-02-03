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


# ==================== 字体管理 API ====================

@app.get("/fonts/scan")
async def scan_fonts():
    """
    扫描系统中所有可用字体

    返回系统字体和自定义字体目录中的所有字体
    """
    from .generator import FontManager
    import platform

    fm = FontManager()
    fonts = []
    seen_fonts = set()

    # 获取系统字体路径
    system = platform.system()
    font_paths = fm._get_system_font_paths()

    for font_path in font_paths:
        if not os.path.exists(font_path):
            continue
        try:
            for root, _, files in os.walk(font_path):
                for file in files:
                    if file.lower().endswith(('.ttf', '.ttc', '.otf')):
                        full_path = os.path.join(root, file)
                        font_name = os.path.splitext(file)[0]

                        # 避免重复
                        if font_name.lower() in seen_fonts:
                            continue
                        seen_fonts.add(font_name.lower())

                        # 判断字体类型
                        is_cjk = any(keyword in file.lower() for keyword in
                                    ['cjk', 'chinese', 'yahei', 'simhei', 'simsun',
                                     'kaiti', 'fangsong', 'noto', 'source', 'pingfang',
                                     'hiragino', 'heiti', 'songti', 'ming', 'gothic'])

                        fonts.append({
                            "name": font_name,
                            "file": file,
                            "path": full_path,
                            "is_cjk": is_cjk,
                            "source": "custom" if font_path == fm.custom_font_dir else "system"
                        })
        except PermissionError:
            continue

    # 按名称排序，CJK字体优先
    fonts.sort(key=lambda x: (not x['is_cjk'], x['name'].lower()))

    return JSONResponse({
        "fonts": fonts,
        "total": len(fonts),
        "custom_font_dir": fm.custom_font_dir,
        "system": system
    })


# ==================== 模板管理 API ====================

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"


@app.get("/templates/presets")
async def get_preset_templates():
    """
    获取预设模板列表
    """
    presets_file = TEMPLATES_DIR / "presets.json"
    if presets_file.exists():
        with open(presets_file, "r", encoding="utf-8") as f:
            presets = json.load(f)
        return JSONResponse(presets)
    return JSONResponse({"presets": []})


@app.get("/templates/safezones")
async def get_safe_zones():
    """
    获取各平台安全区配置

    返回抖音、视频号、小红书等平台的安全区域配置
    """
    safe_zones = {
        "platforms": {
            "douyin": {
                "name": "抖音",
                "canvas": {"width": 1080, "height": 1920},
                "zones": {
                    "top_bar": {"top": 0, "height": 120, "description": "状态栏+导航栏"},
                    "title_area": {"top": 120, "height": 80, "description": "标题区域"},
                    "bottom_bar": {"bottom": 0, "height": 280, "description": "评论/互动栏"},
                    "right_icons": {"right": 0, "width": 80, "height": 400, "bottom": 300, "description": "右侧图标"},
                    "safe_area": {"top": 200, "bottom": 300, "left": 40, "right": 100, "description": "安全区域"}
                }
            },
            "shipinhao": {
                "name": "视频号",
                "canvas": {"width": 1080, "height": 1920},
                "zones": {
                    "top_bar": {"top": 0, "height": 100, "description": "状态栏"},
                    "account_info": {"top": 100, "height": 120, "description": "账号信息"},
                    "bottom_bar": {"bottom": 0, "height": 320, "description": "底部互动栏"},
                    "right_icons": {"right": 0, "width": 70, "height": 350, "bottom": 350, "description": "右侧图标"},
                    "safe_area": {"top": 220, "bottom": 340, "left": 40, "right": 90, "description": "安全区域"}
                }
            },
            "xiaohongshu": {
                "name": "小红书",
                "canvas": {"width": 1080, "height": 1440},
                "zones": {
                    "top_bar": {"top": 0, "height": 90, "description": "状态栏"},
                    "title_area": {"top": 90, "height": 100, "description": "标题区域"},
                    "bottom_bar": {"bottom": 0, "height": 200, "description": "底部互动栏"},
                    "safe_area": {"top": 190, "bottom": 220, "left": 40, "right": 40, "description": "安全区域"}
                }
            },
            "kuaishou": {
                "name": "快手",
                "canvas": {"width": 1080, "height": 1920},
                "zones": {
                    "top_bar": {"top": 0, "height": 110, "description": "状态栏"},
                    "bottom_bar": {"bottom": 0, "height": 300, "description": "底部互动栏"},
                    "right_icons": {"right": 0, "width": 90, "height": 380, "bottom": 320, "description": "右侧图标"},
                    "safe_area": {"top": 150, "bottom": 320, "left": 40, "right": 110, "description": "安全区域"}
                }
            },
            "bilibili": {
                "name": "B站",
                "canvas": {"width": 1080, "height": 1920},
                "zones": {
                    "top_bar": {"top": 0, "height": 100, "description": "状态栏"},
                    "danmaku_area": {"top": 100, "height": 150, "description": "弹幕区域"},
                    "bottom_bar": {"bottom": 0, "height": 260, "description": "底部栏"},
                    "right_icons": {"right": 0, "width": 75, "height": 320, "bottom": 280, "description": "右侧图标"},
                    "safe_area": {"top": 250, "bottom": 280, "left": 40, "right": 95, "description": "安全区域"}
                }
            },
            "instagram_story": {
                "name": "Instagram Stories",
                "canvas": {"width": 1080, "height": 1920},
                "zones": {
                    "top_bar": {"top": 0, "height": 150, "description": "状态栏+用户信息"},
                    "bottom_bar": {"bottom": 0, "height": 180, "description": "底部互动栏"},
                    "safe_area": {"top": 170, "bottom": 200, "left": 40, "right": 40, "description": "安全区域"}
                }
            },
            "instagram_reels": {
                "name": "Instagram Reels",
                "canvas": {"width": 1080, "height": 1920},
                "zones": {
                    "top_bar": {"top": 0, "height": 120, "description": "状态栏"},
                    "bottom_bar": {"bottom": 0, "height": 280, "description": "底部信息栏"},
                    "right_icons": {"right": 0, "width": 80, "height": 400, "bottom": 300, "description": "右侧图标"},
                    "safe_area": {"top": 140, "bottom": 300, "left": 40, "right": 100, "description": "安全区域"}
                }
            },
            "tiktok": {
                "name": "TikTok",
                "canvas": {"width": 1080, "height": 1920},
                "zones": {
                    "top_bar": {"top": 0, "height": 130, "description": "状态栏+搜索"},
                    "bottom_bar": {"bottom": 0, "height": 280, "description": "底部信息栏"},
                    "right_icons": {"right": 0, "width": 85, "height": 420, "bottom": 300, "description": "右侧图标"},
                    "safe_area": {"top": 150, "bottom": 300, "left": 40, "right": 105, "description": "安全区域"}
                }
            },
            "youtube_shorts": {
                "name": "YouTube Shorts",
                "canvas": {"width": 1080, "height": 1920},
                "zones": {
                    "top_bar": {"top": 0, "height": 100, "description": "状态栏"},
                    "bottom_bar": {"bottom": 0, "height": 320, "description": "底部信息栏"},
                    "right_icons": {"right": 0, "width": 70, "height": 350, "bottom": 340, "description": "右侧图标"},
                    "safe_area": {"top": 120, "bottom": 340, "left": 40, "right": 90, "description": "安全区域"}
                }
            },
            "wechat_moments": {
                "name": "微信朋友圈",
                "canvas": {"width": 1080, "height": 1080},
                "zones": {
                    "safe_area": {"top": 40, "bottom": 40, "left": 40, "right": 40, "description": "安全区域"}
                }
            }
        }
    }
    return JSONResponse(safe_zones)


@app.post("/templates/save")
async def save_template(template_data: dict = Body(...)):
    """
    保存模板到服务器

    - **template_data**: 包含 name 和 config 的模板数据
    """
    try:
        TEMPLATES_DIR.mkdir(exist_ok=True)

        name = template_data.get("name", "untitled")
        config = template_data.get("config", {})

        # 生成安全的文件名
        safe_name = "".join(c for c in name if c.isalnum() or c in ('_', '-', ' ')).strip()
        safe_name = safe_name.replace(' ', '_')
        filename = f"{safe_name}_{int(os.urandom(4).hex(), 16)}.json"

        template_path = TEMPLATES_DIR / filename

        with open(template_path, "w", encoding="utf-8") as f:
            json.dump({
                "name": name,
                "config": config,
                "created_at": str(Path(template_path).stat().st_mtime if template_path.exists() else "")
            }, f, ensure_ascii=False, indent=2)

        return JSONResponse({
            "success": True,
            "message": "模板保存成功",
            "filename": filename
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/templates/list")
async def list_templates():
    """
    列出所有已保存的模板
    """
    TEMPLATES_DIR.mkdir(exist_ok=True)

    templates = []
    for file in TEMPLATES_DIR.glob("*.json"):
        if file.name == "presets.json":
            continue
        try:
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)
                templates.append({
                    "filename": file.name,
                    "name": data.get("name", file.stem),
                    "created_at": data.get("created_at", "")
                })
        except:
            continue

    return JSONResponse({"templates": templates})


@app.get("/templates/{filename}")
async def get_template(filename: str):
    """
    获取指定模板
    """
    template_path = TEMPLATES_DIR / filename
    if not template_path.exists():
        raise HTTPException(status_code=404, detail="模板不存在")

    with open(template_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return JSONResponse(data)


@app.delete("/templates/{filename}")
async def delete_template(filename: str):
    """
    删除指定模板
    """
    template_path = TEMPLATES_DIR / filename
    if not template_path.exists():
        raise HTTPException(status_code=404, detail="模板不存在")

    os.remove(template_path)
    return JSONResponse({"success": True, "message": "模板已删除"})


@app.post("/templates/upload")
async def upload_template(template_data: dict = Body(...)):
    """
    上传模板（从JSON导入）
    """
    try:
        TEMPLATES_DIR.mkdir(exist_ok=True)

        name = template_data.get("name", "imported_template")
        config = template_data.get("config", template_data)

        # 如果直接传入的是配置而不是包装的对象
        if "canvas" in template_data and "name" not in template_data:
            config = template_data
            name = "imported_template"

        safe_name = "".join(c for c in name if c.isalnum() or c in ('_', '-', ' ')).strip()
        safe_name = safe_name.replace(' ', '_') or "imported"
        filename = f"{safe_name}_{int(os.urandom(4).hex(), 16)}.json"

        template_path = TEMPLATES_DIR / filename

        with open(template_path, "w", encoding="utf-8") as f:
            json.dump({
                "name": name,
                "config": config,
                "created_at": ""
            }, f, ensure_ascii=False, indent=2)

        return JSONResponse({
            "success": True,
            "message": "模板上传成功",
            "filename": filename,
            "name": name
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
