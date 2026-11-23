#!/bin/sh
set -eu
fixture_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT
mkdir -p "$work_dir/技能包/references"
printf '%s\n' '---' 'name: archive-fixture' 'description: macOS ZIP fixture' '---' '' '# macOS Archive' > "$work_dir/技能包/SKILL.md"
printf '%s\n' '# 中文资源' > "$work_dir/技能包/references/说明.md"
(cd "$work_dir" && /usr/bin/zip -q -r "$fixture_dir/macos.zip" '技能包')
