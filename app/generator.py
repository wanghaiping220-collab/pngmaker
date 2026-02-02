"""
PNG Image Generator Core Module
"""
import os
import platform
from pathlib import Path
from typing import Optional, Tuple, List
from PIL import Image, ImageDraw, ImageFont, ImageFilter

from .models import (
    ImageConfig, TextConfig, CanvasConfig,
    StrokeConfig, ShadowConfig, BackgroundBlockConfig
)


class FontManager:
    """字体管理器"""

    # 常见中文字体路径（根据操作系统）
    SYSTEM_FONT_PATHS = {
        "Windows": [
            "C:/Windows/Fonts",
            os.path.expanduser("~/AppData/Local/Microsoft/Windows/Fonts"),
        ],
        "Linux": [
            "/usr/share/fonts",
            "/usr/local/share/fonts",
            os.path.expanduser("~/.fonts"),
            os.path.expanduser("~/.local/share/fonts"),
        ],
        "Darwin": [  # macOS
            "/System/Library/Fonts",
            "/Library/Fonts",
            os.path.expanduser("~/Library/Fonts"),
        ]
    }

    # 常见中文字体名称映射
    CHINESE_FONTS = {
        "simhei": ["simhei.ttf", "SimHei.ttf", "SIMHEI.TTF"],  # 黑体
        "simsun": ["simsun.ttc", "SimSun.ttc", "SIMSUN.TTC"],  # 宋体
        "msyh": ["msyh.ttc", "msyhbd.ttc", "MSYH.TTC"],  # 微软雅黑
        "kaiti": ["simkai.ttf", "SimKai.ttf", "SIMKAI.TTF"],  # 楷体
        "fangsong": ["simfang.ttf", "SimFang.ttf", "SIMFANG.TTF"],  # 仿宋
        "yahei": ["msyh.ttc", "msyhbd.ttc"],  # 微软雅黑
        "noto": ["NotoSansCJK-Regular.ttc", "NotoSansSC-Regular.otf"],  # Noto Sans CJK
        "source": ["SourceHanSansCN-Regular.otf"],  # 思源黑体
    }

    def __init__(self, custom_font_dir: Optional[str] = None):
        self.custom_font_dir = custom_font_dir or str(Path(__file__).parent.parent / "fonts")
        self.font_cache = {}
        self._default_font = None

    def _get_system_font_paths(self) -> List[str]:
        """获取系统字体路径"""
        system = platform.system()
        paths = self.SYSTEM_FONT_PATHS.get(system, [])
        # 添加自定义字体目录
        if self.custom_font_dir and os.path.exists(self.custom_font_dir):
            paths.insert(0, self.custom_font_dir)
        return paths

    def _find_font_file(self, font_name: str) -> Optional[str]:
        """查找字体文件"""
        # 如果是完整路径
        if os.path.isfile(font_name):
            return font_name

        # 检查是否是预定义的字体名
        font_files = self.CHINESE_FONTS.get(font_name.lower(), [font_name])
        if not isinstance(font_files, list):
            font_files = [font_files]

        # 如果不是 .ttf/.ttc/.otf 结尾，添加扩展名
        expanded_files = []
        for f in font_files:
            expanded_files.append(f)
            if not any(f.lower().endswith(ext) for ext in ['.ttf', '.ttc', '.otf']):
                expanded_files.extend([f"{f}.ttf", f"{f}.ttc", f"{f}.otf"])

        # 在所有字体路径中搜索
        for font_path in self._get_system_font_paths():
            if not os.path.exists(font_path):
                continue
            for root, _, files in os.walk(font_path):
                for file in files:
                    if file in expanded_files or file.lower() in [f.lower() for f in expanded_files]:
                        return os.path.join(root, file)

        return None

    def get_font(self, font_name: str, size: int, bold: bool = False, italic: bool = False) -> ImageFont.FreeTypeFont:
        """获取字体对象"""
        cache_key = (font_name, size, bold, italic)
        if cache_key in self.font_cache:
            return self.font_cache[cache_key]

        font_path = None

        if font_name and font_name != "default":
            font_path = self._find_font_file(font_name)
            # 尝试查找粗体版本
            if bold and font_path:
                bold_variants = [
                    font_path.replace(".ttf", "-Bold.ttf"),
                    font_path.replace(".ttf", "bd.ttf"),
                    font_path.replace(".ttc", "-Bold.ttc"),
                ]
                for variant in bold_variants:
                    if os.path.exists(variant):
                        font_path = variant
                        break

        if font_path:
            try:
                font = ImageFont.truetype(font_path, size)
                self.font_cache[cache_key] = font
                return font
            except Exception as e:
                print(f"Warning: Failed to load font {font_path}: {e}")

        # 回退到默认字体
        return self._get_default_font(size)

    def _get_default_font(self, size: int) -> ImageFont.FreeTypeFont:
        """获取默认字体"""
        # 尝试加载一些常见的中文字体
        default_fonts = [
            "msyh", "simhei", "simsun", "noto", "source",
            "Arial Unicode MS", "DejaVuSans"
        ]

        for font_name in default_fonts:
            font_path = self._find_font_file(font_name)
            if font_path:
                try:
                    return ImageFont.truetype(font_path, size)
                except:
                    continue

        # 最后回退到 Pillow 默认字体
        try:
            return ImageFont.truetype("DejaVuSans.ttf", size)
        except:
            return ImageFont.load_default()


class PNGGenerator:
    """PNG 图片生成器"""

    def __init__(self, font_dir: Optional[str] = None):
        self.font_manager = FontManager(font_dir)

    def _parse_color(self, color: str, opacity: int = 255) -> Tuple[int, int, int, int]:
        """解析颜色字符串为 RGBA 元组"""
        color = color.strip()
        if color.startswith("#"):
            color = color[1:]

        if len(color) == 6:
            r = int(color[0:2], 16)
            g = int(color[2:4], 16)
            b = int(color[4:6], 16)
            return (r, g, b, opacity)
        elif len(color) == 8:
            r = int(color[0:2], 16)
            g = int(color[2:4], 16)
            b = int(color[4:6], 16)
            a = int(color[6:8], 16)
            return (r, g, b, a)
        else:
            raise ValueError(f"Invalid color format: {color}")

    def _create_canvas(self, config: CanvasConfig) -> Image.Image:
        """创建画布"""
        if config.background_color:
            bg_color = self._parse_color(config.background_color)
            return Image.new("RGBA", (config.width, config.height), bg_color)
        else:
            # 透明背景
            return Image.new("RGBA", (config.width, config.height), (0, 0, 0, 0))

    def _get_text_bbox(self, draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> Tuple[int, int]:
        """获取文字边界框尺寸"""
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]

    def _wrap_text(self, text: str, font: ImageFont.FreeTypeFont, max_width: int, draw: ImageDraw.ImageDraw) -> List[str]:
        """文字自动换行"""
        if not max_width:
            return text.split('\n')

        lines = []
        for paragraph in text.split('\n'):
            if not paragraph:
                lines.append('')
                continue

            current_line = ''
            for char in paragraph:
                test_line = current_line + char
                width, _ = self._get_text_bbox(draw, test_line, font)
                if width <= max_width:
                    current_line = test_line
                else:
                    if current_line:
                        lines.append(current_line)
                    current_line = char

            if current_line:
                lines.append(current_line)

        return lines

    def _draw_rounded_rectangle(self, draw: ImageDraw.ImageDraw, xy: Tuple[int, int, int, int],
                                 radius: int, fill: Tuple[int, int, int, int]):
        """绘制圆角矩形"""
        x1, y1, x2, y2 = xy
        if radius <= 0:
            draw.rectangle(xy, fill=fill)
            return

        # 使用 Pillow 的圆角矩形
        draw.rounded_rectangle(xy, radius=radius, fill=fill)

    def _draw_background_block(self, image: Image.Image, text_bbox: Tuple[int, int, int, int],
                                config: BackgroundBlockConfig) -> Image.Image:
        """绘制背景色块"""
        if not config.enabled:
            return image

        x1, y1, x2, y2 = text_bbox

        # 添加内边距
        block_x1 = x1 - config.padding_x
        block_y1 = y1 - config.padding_y
        block_x2 = x2 + config.padding_x
        block_y2 = y2 + config.padding_y

        # 如果有自定义尺寸
        if config.custom_width:
            center_x = (x1 + x2) // 2
            block_x1 = center_x - config.custom_width // 2
            block_x2 = center_x + config.custom_width // 2

        if config.custom_height:
            center_y = (y1 + y2) // 2
            block_y1 = center_y - config.custom_height // 2
            block_y2 = center_y + config.custom_height // 2

        # 创建背景层
        bg_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        bg_draw = ImageDraw.Draw(bg_layer)

        fill_color = self._parse_color(config.color, config.opacity)
        self._draw_rounded_rectangle(
            bg_draw,
            (block_x1, block_y1, block_x2, block_y2),
            config.border_radius,
            fill_color
        )

        # 合并背景层到主图像（背景在下）
        return Image.alpha_composite(bg_layer, image)

    def _draw_text_with_effects(self, image: Image.Image, text_config: TextConfig,
                                 draw: ImageDraw.ImageDraw) -> Image.Image:
        """绘制带特效的文字"""
        font = self.font_manager.get_font(
            text_config.font_family,
            text_config.font_size,
            bold=(text_config.font_weight == "bold"),
            italic=text_config.italic
        )

        # 处理换行
        lines = self._wrap_text(text_config.text, font, text_config.max_width, draw)

        # 计算总高度
        line_heights = []
        total_height = 0
        for line in lines:
            _, h = self._get_text_bbox(draw, line or " ", font)
            line_heights.append(h)
            total_height += int(h * text_config.line_height)

        # 计算起始位置
        current_y = text_config.position_y

        # 计算文字整体边界框（用于背景色块）
        all_text_bbox = None

        for i, line in enumerate(lines):
            if not line:
                current_y += int(line_heights[i] * text_config.line_height)
                continue

            w, h = self._get_text_bbox(draw, line, font)

            # 计算 X 坐标
            if text_config.position_x is not None:
                if text_config.align == "center":
                    x = text_config.position_x - w // 2
                elif text_config.align == "right":
                    x = text_config.position_x - w
                else:
                    x = text_config.position_x
            else:
                # 默认居中
                canvas_width = image.size[0]
                if text_config.align == "center":
                    x = (canvas_width - w) // 2
                elif text_config.align == "right":
                    x = canvas_width - w - 50  # 右边距
                else:
                    x = 50  # 左边距

            # 更新整体边界框
            line_bbox = (x, current_y, x + w, current_y + h)
            if all_text_bbox is None:
                all_text_bbox = line_bbox
            else:
                all_text_bbox = (
                    min(all_text_bbox[0], line_bbox[0]),
                    min(all_text_bbox[1], line_bbox[1]),
                    max(all_text_bbox[2], line_bbox[2]),
                    max(all_text_bbox[3], line_bbox[3])
                )

            current_y += int(h * text_config.line_height)

        # 绘制背景色块（如果启用）
        if text_config.background_block.enabled and all_text_bbox:
            # 创建新的图层来绘制背景
            bg_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
            bg_draw = ImageDraw.Draw(bg_layer)

            x1, y1, x2, y2 = all_text_bbox
            block_config = text_config.background_block

            block_x1 = x1 - block_config.padding_x
            block_y1 = y1 - block_config.padding_y
            block_x2 = x2 + block_config.padding_x
            block_y2 = y2 + block_config.padding_y

            if block_config.custom_width:
                center_x = (x1 + x2) // 2
                block_x1 = center_x - block_config.custom_width // 2
                block_x2 = center_x + block_config.custom_width // 2

            if block_config.custom_height:
                center_y = (y1 + y2) // 2
                block_y1 = center_y - block_config.custom_height // 2
                block_y2 = center_y + block_config.custom_height // 2

            fill_color = self._parse_color(block_config.color, block_config.opacity)
            self._draw_rounded_rectangle(
                bg_draw,
                (block_x1, block_y1, block_x2, block_y2),
                block_config.border_radius,
                fill_color
            )

            # 合成背景层
            image = Image.alpha_composite(image, bg_layer)
            draw = ImageDraw.Draw(image)

        # 重新计算并绘制文字
        current_y = text_config.position_y

        for i, line in enumerate(lines):
            if not line:
                current_y += int(line_heights[i] * text_config.line_height)
                continue

            w, h = self._get_text_bbox(draw, line, font)

            # 计算 X 坐标
            if text_config.position_x is not None:
                if text_config.align == "center":
                    x = text_config.position_x - w // 2
                elif text_config.align == "right":
                    x = text_config.position_x - w
                else:
                    x = text_config.position_x
            else:
                canvas_width = image.size[0]
                if text_config.align == "center":
                    x = (canvas_width - w) // 2
                elif text_config.align == "right":
                    x = canvas_width - w - 50
                else:
                    x = 50

            text_color = self._parse_color(text_config.color)

            # 绘制阴影
            if text_config.shadow.enabled:
                shadow_color = self._parse_color(text_config.shadow.color)
                shadow_x = x + text_config.shadow.offset_x
                shadow_y = current_y + text_config.shadow.offset_y

                if text_config.shadow.blur > 0:
                    # 创建阴影层并模糊
                    shadow_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
                    shadow_draw = ImageDraw.Draw(shadow_layer)
                    shadow_draw.text((shadow_x, shadow_y), line, font=font, fill=shadow_color)
                    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(text_config.shadow.blur))
                    image = Image.alpha_composite(image, shadow_layer)
                    draw = ImageDraw.Draw(image)
                else:
                    draw.text((shadow_x, shadow_y), line, font=font, fill=shadow_color)

            # 绘制描边
            if text_config.stroke.enabled:
                stroke_color = self._parse_color(text_config.stroke.color)
                stroke_width = text_config.stroke.width
                draw.text((x, current_y), line, font=font, fill=text_color,
                         stroke_width=stroke_width, stroke_fill=stroke_color)
            else:
                draw.text((x, current_y), line, font=font, fill=text_color)

            current_y += int(h * text_config.line_height)

        return image

    def generate(self, config: ImageConfig, output_dir: str = "output") -> str:
        """生成单张图片"""
        # 创建输出目录
        os.makedirs(output_dir, exist_ok=True)

        # 创建画布
        image = self._create_canvas(config.canvas)
        draw = ImageDraw.Draw(image)

        # 按顺序绘制各个文字元素
        text_elements = []

        if config.title_primary:
            text_elements.append(config.title_primary)

        if config.title_secondary:
            text_elements.append(config.title_secondary)

        if config.title_tertiary:
            text_elements.append(config.title_tertiary)

        if config.body_text:
            text_elements.append(config.body_text)

        # 添加自定义文字
        text_elements.extend(config.custom_texts)

        # 绘制所有文字
        for text_config in text_elements:
            image = self._draw_text_with_effects(image, text_config, draw)
            draw = ImageDraw.Draw(image)  # 刷新 draw 对象

        # 保存图片
        output_path = os.path.join(output_dir, config.output_filename)
        image.save(output_path, "PNG")

        return output_path

    def generate_batch(self, configs: List[ImageConfig], output_dir: str = "output") -> List[str]:
        """批量生成图片"""
        output_paths = []
        for config in configs:
            path = self.generate(config, output_dir)
            output_paths.append(path)
        return output_paths
