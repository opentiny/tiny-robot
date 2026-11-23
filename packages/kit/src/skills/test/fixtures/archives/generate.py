"""Regenerate deterministic interoperability fixtures with Python's standard archive writers."""
import gzip
import io
from pathlib import Path
import tarfile
import zipfile

root = Path(__file__).parent
skill = b'---\nname: archive-skill\ndescription: Archive fixture\n---\n\n# Archive skill'
resources = {
    'SKILL.md': skill,
    'references/说明.md': '# 使用说明'.encode('utf-8'),
    'assets/icon.bin': bytes([0, 128, 255, 1]),
    '.hidden.txt': b'hidden resource',
    '.DS_Store': b'ignored',
    '__MACOSX/._SKILL.md': b'ignored',
}

for layout, prefix in [('root', ''), ('wrapped', '技能包/')]:
    for method, compression in [('stored', zipfile.ZIP_STORED), ('deflate', zipfile.ZIP_DEFLATED)]:
        with zipfile.ZipFile(root / f'{layout}-{method}.zip', 'w') as archive:
            for directory in ['.' if not prefix else prefix.rstrip('/'), f'{prefix}references', f'{prefix}assets']:
                info = zipfile.ZipInfo(f'{directory}/', date_time=(2020, 1, 1, 0, 0, 0))
                info.external_attr = (0o40755 << 16) | 0x10
                archive.writestr(info, b'')
            for name, content in resources.items():
                info = zipfile.ZipInfo(f'{prefix}{name}', date_time=(2020, 1, 1, 0, 0, 0))
                info.compress_type = compression
                archive.writestr(info, content)

buffer = io.BytesIO()
with tarfile.open(fileobj=buffer, mode='w', format=tarfile.PAX_FORMAT) as archive:
    for directory in ['.', './references', './assets']:
        info = tarfile.TarInfo(directory)
        info.type = tarfile.DIRTYPE
        archive.addfile(info)
    for name, content in resources.items():
        info = tarfile.TarInfo(f'./{name}')
        info.size = len(content)
        archive.addfile(info, io.BytesIO(content))
tar = buffer.getvalue()
(root / 'root.tar').write_bytes(tar)
(root / 'root.tar.gz').write_bytes(gzip.compress(tar, mtime=0))

with zipfile.ZipFile(root / 'expanded.zip', 'w', compression=zipfile.ZIP_DEFLATED) as archive:
    info = zipfile.ZipInfo('SKILL.md', (2020, 1, 1, 0, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    archive.writestr(info, skill + b'\n' + b'instructions\n' * 200)

with zipfile.ZipFile(root.parents[6] / 'docs/src/public/skill-import-example.zip', 'w') as archive:
    for name, content in {
        'example-skill/SKILL.md': '---\nname: example-skill\ndescription: 用于试用 Skill 导入。\n---\n\n# 使用说明\n\n请总结输入文档的要点。\n'.encode(),
        'example-skill/references/说明.md': '# 参考资料\n\n请保留重要结论。\n'.encode(),
    }.items():
        archive.writestr(zipfile.ZipInfo(name, (2020, 1, 1, 0, 0, 0)), content)

files = {
    'package/SKILL.md': b'---\nname: archive-fixture\ndescription: Real archive fixture\n---\n\n# Import from archive\n',
    'package/references/guide.md': 'Reference: 中文资源\n'.encode(),
    'package/assets/icon.png': bytes([0, 137, 80, 78, 71, 255]),
}
long_path = 'package/references/' + 'long-directory/' * 9 + '说明.md'

for name, method in [('deflate.zip', zipfile.ZIP_DEFLATED), ('stored.zip', zipfile.ZIP_STORED)]:
    with zipfile.ZipFile(root / name, 'w', compression=method) as archive:
        for path, content in files.items():
            info = zipfile.ZipInfo(path, (2020, 1, 1, 0, 0, 0))
            info.compress_type = method
            archive.writestr(info, content)

for name, archive_format in [('ustar.tar', tarfile.USTAR_FORMAT), ('pax.tar', tarfile.PAX_FORMAT), ('gnu.tar', tarfile.GNU_FORMAT)]:
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode='w', format=archive_format) as archive:
        entries = dict(files)
        if archive_format != tarfile.USTAR_FORMAT:
            entries[long_path] = b'Long path reference\n'
        for path, content in entries.items():
            info = tarfile.TarInfo(path)
            info.size = len(content)
            info.mtime = 1577836800
            archive.addfile(info, io.BytesIO(content))
    tar_bytes = buffer.getvalue()
    (root / name).write_bytes(tar_bytes)
    if name == 'ustar.tar':
        (root / 'skill.tar.gz').write_bytes(gzip.compress(tar_bytes, mtime=0))
