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
parser.add_argument('--action', choices=['peek', 'confess', 'ha', 'claude', 'rice', 'sneak', 'slack', 'parcel', 'coffee', 'goodnight'], default='peek')
parser.add_argument('--only-selected', action='store_true', help='Embed only the selected story for a smaller standalone preview')
args = parser.parse_args()
name = args.name
if not re.fullmatch(r'[A-Za-z0-9_-]+', name):
    raise SystemExit('Preview name must contain only letters, digits, hyphens or underscores')

root = Path(__file__).resolve().parent.parent
dist = root / 'desktop' / 'dist'
output = root / 'desktop' / 'release' / 'drafts'
output.mkdir(parents=True, exist_ok=True)
html = (dist / 'preview.html').read_text(encoding='utf-8')
html = html.replace('data-preview="peek"', 'data-preview="' + args.action + '"')
if args.only_selected:
    html = html.replace('data-preview="' + args.action + '"', 'data-preview="' + args.action + '" data-only-action="' + args.action + '"')
nonce = 'local-peek-preview'
html = html.replace("script-src 'self'", "script-src 'nonce-" + nonce + "'")
for filename in ['preview.js', 'renderer.js', 'client.js']:
    source = (dist / filename).read_text(encoding='utf-8')
    if filename == 'renderer.js':
        pattern = r'new URL\((.+?),window\.location\.href\)\.href'
        story_dirs = {'peek': ('alt-peek', 8), 'confess': ('alt-confess', 7), 'ha': ('mint-ha', 5), 'claude': ('mint-claude', 6), 'rice': ('mint-rice', 5), 'sneak': ('mint-sneak', 1), 'slack': ('mint-slack', 1), 'parcel': ('mint-parcel', 1), 'coffee': ('alt-coffee', 1), 'goodnight': ('alt-goodnight', 1)}
        selected_dirs = [story_dirs[args.action]] if args.only_selected else list(story_dirs.values())
        images = {directory.name + '/' + p.name: 'data:image/png;base64,' + base64.b64encode(p.read_bytes()).decode('ascii') for directory in [dist / directory for directory, count in selected_dirs] for p in directory.glob('*.png')}
        if len(images) != sum(count for directory, count in selected_dirs):
            raise SystemExit('Missing special-action images')
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
