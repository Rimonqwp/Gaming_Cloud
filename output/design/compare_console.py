from pathlib import Path
from PIL import Image
import sys

root = Path(__file__).resolve().parent
capture_name = sys.argv[1] if len(sys.argv) > 1 else 'dashboard-implementation-first.png'
stem = sys.argv[2] if len(sys.argv) > 2 else 'dashboard-comparison-first'
reference = Image.open(root / 'dashboard-target.png').convert('RGB')
capture = Image.open(root / capture_name).convert('RGB')
print({'source': reference.size, 'capture': capture.size})
capture = capture.resize(reference.size, Image.Resampling.LANCZOS)
combined = Image.new('RGB', (reference.width * 2, reference.height), 'white')
combined.paste(reference, (0, 0))
combined.paste(capture, (reference.width, 0))
combined.save(root / f'{stem}.png')
for name, box in {'navigation':(55,0,1435,83),'table':(62,393,1426,724),'charts':(62,741,1426,1039)}.items():
    left, right = reference.crop(box), capture.crop(box)
    panel = Image.new('RGB', (left.width, left.height * 2 + 12), 'white')
    panel.paste(left, (0,0))
    panel.paste(right, (0,left.height+12))
    panel.save(root / f'{stem}-{name}.png')
