from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
source = Image.open(r'C:/Users/Rimon12/AppData/Local/Temp/codex-clipboard-1a87849d-2382-43c9-97be-14e8388c8930.png').convert('RGBA')
destination = root / 'public' / 'console'
destination.mkdir(parents=True, exist_ok=True)
source.save(root / 'output' / 'design' / 'dashboard-target.png')
for name, box in {
    'brand.png': (85, 20, 247, 59),
    'avatar.png': (1258, 23, 1295, 60),
    'sg.png': (611, 520, 647, 550),
    'hk.png': (611, 592, 647, 622),
    'jp.png': (611, 667, 647, 697),
}.items():
    asset = source.crop(box)
    if name in ('brand.png', 'avatar.png'):
        pixels = asset.load()
        for y in range(asset.height):
            for x in range(asset.width):
                r, g, b, a = pixels[x, y]
                if min(r, g, b) > 220:
                    pixels[x, y] = (r, g, b, 0)
    asset.save(destination / name)
