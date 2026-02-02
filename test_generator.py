#!/usr/bin/env python
"""
测试脚本 - 测试 PNG Generator 的基本功能
"""
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models import (
    ImageConfig, CanvasConfig, TitleConfig, TextConfig,
    StrokeConfig, ShadowConfig, BackgroundBlockConfig
)
from app.generator import PNGGenerator


def test_basic_generation():
    """测试基本图片生成"""
    print("=" * 50)
    print("测试 1: 基本图片生成")
    print("=" * 50)

    config = ImageConfig(
        canvas=CanvasConfig(
            width=1080,
            height=1920,
            background_color=None  # 透明背景
        ),
        title_primary=TitleConfig(
            text="小鹏P7+挑战多米诺车位",
            font_size=64,
            font_weight="bold",
            color="#FF6600",
            position_y=100,
            align="center"
        ),
        title_secondary=TitleConfig(
            text="从一穷二白到反客为主\n只用了几十年",
            font_size=52,
            font_weight="bold",
            color="#1E90FF",
            position_y=200,
            align="center",
            italic=True
        ),
        body_text=TextConfig(
            text="以前觉得这种高科技离我们很远，\n现在看着老外惊叹的表情，\n才发现轻舟已过万重山了。",
            font_size=42,
            color="#FF6600",
            position_y=1400,
            align="center",
            italic=True
        ),
        output_filename="test_basic.png"
    )

    generator = PNGGenerator()
    output_path = generator.generate(config, "output")
    print(f"✓ 图片已生成: {output_path}")
    return True


def test_with_effects():
    """测试带特效的图片生成"""
    print("\n" + "=" * 50)
    print("测试 2: 带特效的图片生成（描边、阴影、背景色块）")
    print("=" * 50)

    config = ImageConfig(
        canvas=CanvasConfig(
            width=1080,
            height=1920,
            background_color=None
        ),
        title_primary=TitleConfig(
            text="特效测试",
            font_size=72,
            font_weight="bold",
            color="#FFFFFF",
            position_y=100,
            align="center",
            stroke=StrokeConfig(
                enabled=True,
                color="#000000",
                width=3
            ),
            shadow=ShadowConfig(
                enabled=True,
                color="#333333",
                offset_x=4,
                offset_y=4,
                blur=2
            )
        ),
        title_secondary=TitleConfig(
            text="带背景色块的文字",
            font_size=48,
            color="#333333",
            position_y=250,
            align="center",
            background_block=BackgroundBlockConfig(
                enabled=True,
                color="#FFD700",
                opacity=200,
                padding_x=30,
                padding_y=15,
                border_radius=15
            )
        ),
        output_filename="test_effects.png"
    )

    generator = PNGGenerator()
    output_path = generator.generate(config, "output")
    print(f"✓ 图片已生成: {output_path}")
    return True


def test_batch_generation():
    """测试批量生成"""
    print("\n" + "=" * 50)
    print("测试 3: 批量生成")
    print("=" * 50)

    configs = []
    titles = ["第一张", "第二张", "第三张"]

    for i, title in enumerate(titles):
        config = ImageConfig(
            canvas=CanvasConfig(width=1080, height=1920),
            title_primary=TitleConfig(
                text=f"{title}图片",
                font_size=64,
                font_weight="bold",
                color="#FF6600",
                position_y=100
            ),
            output_filename=f"test_batch_{i+1:03d}.png"
        )
        configs.append(config)

    generator = PNGGenerator()
    output_paths = generator.generate_batch(configs, "output")

    for path in output_paths:
        print(f"✓ 图片已生成: {path}")

    return True


def main():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("  PNG Batch Generator 测试")
    print("=" * 60)

    # 确保输出目录存在
    os.makedirs("output", exist_ok=True)

    tests = [
        test_basic_generation,
        test_with_effects,
        test_batch_generation
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"✗ 测试失败: {e}")
            failed += 1

    print("\n" + "=" * 60)
    print(f"  测试完成: {passed} 通过, {failed} 失败")
    print("=" * 60)

    if failed == 0:
        print("\n所有测试通过！生成的图片保存在 output/ 目录")
    else:
        print("\n部分测试失败，请检查错误信息")
        sys.exit(1)


if __name__ == "__main__":
    main()
