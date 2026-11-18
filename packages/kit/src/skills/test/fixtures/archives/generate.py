from io import BytesIO
from pathlib import Path
import gzip
import tarfile
import zipfile

destination = Path(__file__).parent
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
        with zipfile.ZipFile(destination / f'{layout}-{method}.zip', 'w') as archive:
            for directory in ['.' if not prefix else prefix.rstrip('/'), f'{prefix}references', f'{prefix}assets']:
                info = zipfile.ZipInfo(f'{directory}/', date_time=(2020, 1, 1, 0, 0, 0))
                info.external_attr = (0o40755 << 16) | 0x10
                archive.writestr(info, b'')
            for name, content in resources.items():
                info = zipfile.ZipInfo(f'{prefix}{name}', date_time=(2020, 1, 1, 0, 0, 0))
                info.compress_type = compression
                archive.writestr(info, content)

buffer = BytesIO()
with tarfile.open(fileobj=buffer, mode='w', format=tarfile.PAX_FORMAT) as archive:
    for directory in ['.', './references', './assets']:
        info = tarfile.TarInfo(directory)
        info.type = tarfile.DIRTYPE
        archive.addfile(info)
    for name, content in resources.items():
        info = tarfile.TarInfo(f'./{name}')
        info.size = len(content)
        archive.addfile(info, BytesIO(content))
tar = buffer.getvalue()
(destination / 'root.tar').write_bytes(tar)
(destination / 'root.tar.gz').write_bytes(gzip.compress(tar, mtime=0))
