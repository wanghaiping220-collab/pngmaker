"""
Pydantic models for PNG Generator configuration
"""
from typing import Optional, List, Literal
from pydantic import BaseModel, Field


class ShadowConfig(BaseModel):
    """文字阴影配置"""
    enabled: bool = False
    color: str = Field(default="#000000", description="阴影颜色 (hex)")
    offset_x: int = Field(default=2, description="水平偏移")
    offset_y: int = Field(default=2, description="垂直偏移")
    blur: int = Field(default=0, description="模糊半径")


class StrokeConfig(BaseModel):
    """文字描边配置"""
    enabled: bool = False
    color: str = Field(default="#000000", description="描边颜色 (hex)")
    width: int = Field(default=2, description="描边宽度")


class BackgroundBlockConfig(BaseModel):
    """背景色块配置"""
    enabled: bool = False
    color: str = Field(default="#FFFFFF", description="背景色块颜色 (hex)")
    opacity: int = Field(default=255, ge=0, le=255, description="透明度 0-255")
    padding_x: int = Field(default=20, description="水平内边距")
    padding_y: int = Field(default=10, description="垂直内边距")
    border_radius: int = Field(default=0, description="圆角半径")
    # 可选：自定义宽高，如果不设置则自动根据文字大小计算
    custom_width: Optional[int] = Field(default=None, description="自定义宽度")
    custom_height: Optional[int] = Field(default=None, description="自定义高度")


class TextConfig(BaseModel):
    """单个文字元素配置"""
    text: str = Field(..., description="文字内容")
    font_family: str = Field(default="default", description="字体名称或路径")
    font_size: int = Field(default=48, ge=1, description="字体大小")
    font_weight: Literal["normal", "bold"] = Field(default="normal", description="字体粗细")
    color: str = Field(default="#000000", description="文字颜色 (hex)")

    # 位置配置
    position_x: Optional[int] = Field(default=None, description="X坐标，None为居中")
    position_y: int = Field(..., description="Y坐标")
    align: Literal["left", "center", "right"] = Field(default="center", description="对齐方式")

    # 行高和行间距
    line_height: float = Field(default=1.5, description="行高倍数")
    max_width: Optional[int] = Field(default=None, description="最大宽度，超出自动换行")

    # 文字框尺寸（PS风格）
    box_height: Optional[int] = Field(default=None, description="文字框高度，超出时自动缩放字号")
    auto_scale: bool = Field(default=True, description="超出高度时是否自动缩放字号")
    min_font_size: int = Field(default=12, ge=8, description="自动缩放时的最小字号")

    # 特效
    stroke: StrokeConfig = Field(default_factory=StrokeConfig)
    shadow: ShadowConfig = Field(default_factory=ShadowConfig)
    background_block: BackgroundBlockConfig = Field(default_factory=BackgroundBlockConfig)

    # 是否斜体
    italic: bool = Field(default=False, description="是否斜体")


class TitleConfig(TextConfig):
    """标题配置（继承自TextConfig）"""
    pass


class CanvasConfig(BaseModel):
    """画布配置"""
    width: int = Field(default=1080, ge=1, description="画布宽度")
    height: int = Field(default=1920, ge=1, description="画布高度")
    background_color: Optional[str] = Field(default=None, description="背景颜色，None为透明")


class ImageConfig(BaseModel):
    """完整图片配置"""
    canvas: CanvasConfig = Field(default_factory=CanvasConfig)

    # 标题配置
    title_primary: Optional[TitleConfig] = Field(default=None, description="一级标题")
    title_secondary: Optional[TitleConfig] = Field(default=None, description="二级标题")
    title_tertiary: Optional[TitleConfig] = Field(default=None, description="三级标题（可选）")

    # 正文配置
    body_text: Optional[TextConfig] = Field(default=None, description="正文（可选）")

    # 额外的自定义文字元素
    custom_texts: List[TextConfig] = Field(default_factory=list, description="额外自定义文字")

    # 输出配置
    output_filename: str = Field(default="output.png", description="输出文件名")


class BatchConfig(BaseModel):
    """批量生成配置"""
    images: List[ImageConfig] = Field(..., description="图片配置列表")
    output_dir: str = Field(default="output", description="输出目录")


class BatchTextReplaceConfig(BaseModel):
    """批量文字替换配置 - 使用模板快速生成多张图片"""
    template: ImageConfig = Field(..., description="模板配置")
    replacements: List[dict] = Field(..., description="替换内容列表，每个dict对应一张图片")
    output_dir: str = Field(default="output", description="输出目录")
    filename_prefix: str = Field(default="image_", description="文件名前缀")


class GenerateResponse(BaseModel):
    """生成响应"""
    success: bool
    message: str
    output_path: Optional[str] = None
    output_paths: Optional[List[str]] = None


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    version: str
