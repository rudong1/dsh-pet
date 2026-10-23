"""Bundle the local animation draft into one offline HTML file and a small ZIP.
No pixel processing: the generated transparent frames is embedded unchanged.
"""
import base64
import argparse
import re
import json
import zipfile
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--name', default='alt-peek-preview')
name = parser.parse_args().name
if not re.fullmatch(r'[A-Za-z0-9_-]+', name):
    raise SystemExit('Preview name must contain only letters, digits, hyphens or underscores')

root = Path(__file__).resolve().parent.parent
dist = root / 'desktop' / 'dist'
output = root / 'desktop' / 'release' / 'drafts'
output.mkdir(parents=True, exist_ok=True)
html = (dist / 'preview.html').read_text(encoding='utf-8')
nonce = 'local-peek-preview'
html = html.replace("script-src 'self'", "script-src 'nonce-" + nonce + "'")
for filename in ['preview.js', 'renderer.js', 'client.js']:
    source = (dist / filename).read_text(encoding='utf-8')
    if filename == 'renderer.js':
        pattern = r'new URL\((.+?),window\.location\.href\)\.href'
        images = {directory.name + '/' + p.name: 'data:image/png;base64,' + base64.b64encode(p.read_bytes()).decode('ascii') for directory in [dist / 'alt-peek', dist / 'alt-confess'] for p in directory.glob('*.png')}
        if len(images) != 15:
            raise SystemExit('Expected all 15 special-action images')
        source, count = re.subn(pattern, lambda m: '(' + json.dumps(images) + ')[' + m.group(1) + ']', source)
        if count != 1:
            raise SystemExit('Frame URL anchor changed; inspect renderer bundle')
    source = source.replace('</script', '<\\/script')
    html = html.replace('<script src="' + filename + '"></script>', '<script nonce="' + nonce + '">' + source + '</script>')
preview = output / (name + '.html')
preview.write_text(html, encoding='utf-8')
with zipfile.ZipFile(output / (name + '.zip'), 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.write(preview, preview.name)
    archive.writestr('README.txt', '解压后双击包内的 HTML 文件，即可离线查看动画草稿。\n仅预览，不安装、不更新、不替换你现在的桌宠。\n棋盘格只是透明度指示，不是素材背景。\n')
print('Created offline HTML and ZIP:', output)
