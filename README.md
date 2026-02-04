# PNG Batch Generator

批量生成PNG透明底图片的本地应用，支持自定义文字、字体、颜色、描边、阴影、背景色块等，并提供API接口供n8n等工作流工具调用。

## 更新日志

### v1.2.0 (2026-02-03)

**新增功能：**
- 🎯 **社交媒体安全区** - 支持10个平台的文字排版安全区参考线：
  - 抖音、视频号、小红书、快手、B站
  - TikTok、Instagram Story/Post、YouTube Shorts、朋友圈
- 📋 **15个预设模板** - 新闻标题、励志语录、科技产品、美食推荐、知识科普、旅行Vlog、促销活动、健身运动、影视点评、生活妙招、萌宠日常、前后对比、游戏精彩、小红书分享、简约风格
- 🔤 **本地字体库支持** - 自动扫描系统已安装字体，智能识别中文字体
- 💾 **模板管理** - 支持模板的保存、下载（JSON）和上传导入
- ✨ **全元素高级特效** - 所有文字元素（一级、二级、三级标题及正文）均支持描边、阴影、背景色块
- 📍 **自定义X位置** - 所有文字元素支持自定义X坐标位置

### v1.1.0 (2026-02-02)

**新增功能：**
- 🖥️ **现代化Web界面** - 提供可视化配置前端，实时预览效果
- 📊 **批量生成面板** - 支持CSV/JSON数据批量生成图片
- 📁 **模板管理** - 保存和加载常用配置
- 📜 **历史记录** - 自动保存生成历史，支持一键复用

### v1.0.0 (2026-02-02)

**初始版本：**
- PNG透明底图片生成
- REST API接口
- 多级标题和正文支持
- 文字描边、阴影、背景色块

---

## 功能特性

### 核心功能
- **透明背景PNG生成**: 支持生成透明底图片
- **自定义画布**: 分辨率可自定义，默认1080x1920像素
- **多级标题**: 支持一级、二级、三级标题和正文
- **丰富的文字样式**:
  - 字体、大小、颜色
  - 描边（颜色、宽度）
  - 阴影（颜色、偏移、模糊）
  - 背景色块（颜色、透明度、圆角、内边距）
  - 斜体、粗体
- **批量生成**: 支持批量生成多张图片
- **模板替换**: 使用模板快速生成相似图片
- **REST API**: 提供完整的API接口，支持n8n等工具调用
- **完全本地运行**: 无需付费API，所有处理在本地完成

### Web前端界面
- **可视化编辑器**: 实时预览图片效果
- **平台预设**: 快速选择社交媒体平台尺寸
- **安全区参考线**: 显示各平台UI遮挡区域，避免文字被遮挡
- **预设模板**: 15种常用场景模板一键应用
- **模板管理**: 保存、加载、下载、上传模板
- **批量生成**: CSV/JSON数据批量生成
- **历史记录**: 自动保存生成历史

### 支持的社交媒体平台安全区

| 平台 | 尺寸 | 顶部安全区 | 底部安全区 | 右侧安全区 |
|------|------|-----------|-----------|-----------|
| 抖音 | 1080×1920 | 200px | 300px | 120px |
| 视频号 | 1080×1920 | 180px | 280px | 100px |
| 小红书 | 1080×1440 | 150px | 220px | 80px |
| 快手 | 1080×1920 | 190px | 290px | 110px |
| B站 | 1080×1920 | 180px | 250px | 90px |
| TikTok | 1080×1920 | 200px | 300px | 120px |
| Instagram Story | 1080×1920 | 180px | 220px | 80px |
| Instagram Post | 1080×1080 | 50px | 150px | 50px |
| YouTube Shorts | 1080×1920 | 150px | 280px | 100px |
| 朋友圈 | 1080×1440 | 50px | 120px | 50px |

## 安装

### 环境要求

- Python 3.8+
- Windows / Linux / macOS

### 安装步骤

1. 克隆或下载项目
```bash
git clone <repository-url>
cd pngmaker
```

2. 安装依赖
```bash
pip install -r requirements.txt
```

3. （可选）安装中文字体

Windows系统通常已内置中文字体。Linux系统可安装：
```bash
# Ubuntu/Debian
sudo apt-get install fonts-noto-cjk

# CentOS/RHEL
sudo yum install google-noto-sans-cjk-fonts
```

## 快速开始

### 启动服务

**Windows:**
```batch
双击 run.bat
# 或
python run.py
```

**Linux/macOS:**
```bash
chmod +x run.sh
./run.sh
# 或
python3 run.py
```

### 访问API文档

启动后访问: http://localhost:8000/docs

### 命令行参数

```bash
python run.py --host 0.0.0.0 --port 8000 --reload
```

- `--host`: 监听地址（默认: 0.0.0.0）
- `--port`: 端口号（默认: 8000）
- `--reload`: 启用热重载（开发模式）
- `--workers`: 工作进程数（默认: 1）

## API 接口

### 健康检查

```
GET /health
```

### 生成单张图片

```
POST /generate
Content-Type: application/json

{
  "canvas": {
    "width": 1080,
    "height": 1920,
    "background_color": null
  },
  "title_primary": {
    "text": "主标题",
    "font_size": 64,
    "color": "#FF6600",
    "position_y": 100
  },
  "output_filename": "output.png"
}
```

### 生成图片并返回Base64

```
POST /generate/base64
```

### 生成图片并直接下载

```
POST /generate/download
```

### 批量生成

```
POST /generate/batch

{
  "images": [...],
  "output_dir": "output"
}
```

### 模板批量生成

```
POST /generate/batch/template

{
  "template": {...},
  "replacements": [
    {"title_primary.text": "新标题1", "output_filename": "001.png"},
    {"title_primary.text": "新标题2", "output_filename": "002.png"}
  ]
}
```

### 简化接口（URL参数）

```
POST /generate/simple?title_primary_text=标题&title_secondary_text=副标题&return_base64=true
```

### 获取示例配置

```
GET /example/config
GET /example/batch
```

### 列出可用字体

```
GET /fonts
```

## 配置说明

### 画布配置 (canvas)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | int | 1080 | 画布宽度 |
| height | int | 1920 | 画布高度 |
| background_color | string | null | 背景颜色，null为透明 |

### 文字配置 (TextConfig)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | string | - | 文字内容（必填） |
| font_family | string | "default" | 字体名称或路径 |
| font_size | int | 48 | 字体大小 |
| font_weight | string | "normal" | 字体粗细: normal/bold |
| color | string | "#000000" | 文字颜色 |
| position_x | int | null | X坐标，null为自动 |
| position_y | int | - | Y坐标（必填） |
| align | string | "center" | 对齐: left/center/right |
| line_height | float | 1.5 | 行高倍数 |
| max_width | int | null | 最大宽度，超出自动换行 |
| italic | bool | false | 是否斜体 |

### 描边配置 (stroke)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enabled | bool | false | 是否启用 |
| color | string | "#000000" | 描边颜色 |
| width | int | 2 | 描边宽度 |

### 阴影配置 (shadow)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enabled | bool | false | 是否启用 |
| color | string | "#000000" | 阴影颜色 |
| offset_x | int | 2 | 水平偏移 |
| offset_y | int | 2 | 垂直偏移 |
| blur | int | 0 | 模糊半径 |

### 背景色块配置 (background_block)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enabled | bool | false | 是否启用 |
| color | string | "#FFFFFF" | 背景颜色 |
| opacity | int | 255 | 透明度 (0-255) |
| padding_x | int | 20 | 水平内边距 |
| padding_y | int | 10 | 垂直内边距 |
| border_radius | int | 0 | 圆角半径 |
| custom_width | int | null | 自定义宽度 |
| custom_height | int | null | 自定义高度 |

## n8n 集成示例

### HTTP Request 节点配置

1. 方法: POST
2. URL: http://localhost:8000/generate
3. Body Type: JSON
4. Body:

```json
{
  "canvas": {
    "width": 1080,
    "height": 1920
  },
  "title_primary": {
    "text": "{{ $json.title }}",
    "font_size": 64,
    "color": "#FF6600",
    "position_y": 100
  },
  "output_filename": "{{ $json.filename }}"
}
```

### 使用简化API

```
POST http://localhost:8000/generate/simple
Query Parameters:
- title_primary_text: {{ $json.title }}
- title_secondary_text: {{ $json.subtitle }}
- return_base64: true
```

## 支持的字体

### 预定义字体名称

- `simhei` - 黑体
- `simsun` - 宋体
- `msyh` / `yahei` - 微软雅黑
- `kaiti` - 楷体
- `fangsong` - 仿宋
- `noto` - Noto Sans CJK
- `source` - 思源黑体

### 使用自定义字体

1. 将字体文件(.ttf/.ttc/.otf)放入 `fonts/` 目录
2. 在配置中使用字体文件名或完整路径

```json
{
  "font_family": "MyCustomFont.ttf"
}
```

## 目录结构

```
pngmaker/
├── app/
│   ├── __init__.py
│   ├── models.py      # 数据模型
│   ├── generator.py   # 图片生成核心
│   ├── api.py         # FastAPI 接口
│   └── main.py        # 入口点
├── fonts/             # 自定义字体目录
├── output/            # 默认输出目录
├── examples/          # 示例配置
├── requirements.txt   # 依赖
├── run.py             # 启动脚本
├── run.bat            # Windows 启动脚本
├── run.sh             # Linux/macOS 启动脚本
└── README.md
```

## 常见问题

### Q: 中文显示为方框或乱码？

A: 需要安装中文字体。Windows通常已内置，Linux需手动安装:
```bash
sudo apt-get install fonts-noto-cjk
```

### Q: 如何添加自定义字体？

A: 将字体文件放入 `fonts/` 目录，然后在配置中指定字体名称。

### Q: 如何在Docker中运行？

A: 创建Dockerfile:
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y fonts-noto-cjk
COPY . .
EXPOSE 8000
CMD ["python", "run.py"]
```

## License

MIT License
