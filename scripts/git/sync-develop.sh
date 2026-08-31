#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf 'Usage: %s <source-start-sha> [YYYY-MM-DD]\n' "${0##*/}" >&2
}

die() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

validate_date() {
  local candidate=$1
  local normalized=''

  [[ "$candidate" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || return 1

  if normalized=$(date -j -f '%Y-%m-%d' "$candidate" '+%Y-%m-%d' 2>/dev/null); then
    :
  elif normalized=$(date -d "$candidate" '+%Y-%m-%d' 2>/dev/null); then
    :
  else
    return 1
  fi

  [[ "$normalized" == "$candidate" ]]
}

tree_entry() {
  local treeish=$1
  local path=$2
  git ls-tree "$treeish" -- "$path" | awk 'NR == 1 { print $1 " " $2 " " $3 }'
}

print_commit_row() {
  local ordinal=$1
  local sha=$2
  local author_date
  local author
  local subject
  local counts

  author_date=$(git show -s --date=short --format='%ad' "$sha")
  author=$(git show -s --format='%an' "$sha")
  subject=$(git show -s --format='%s' "$sha")
  counts=$(git show --format= --numstat "$sha" | awk '
    $1 ~ /^[0-9]+$/ && $2 ~ /^[0-9]+$/ {
      additions += $1
      deletions += $2
    }
    END {
      printf "%d\t%d\t%d", additions, deletions, additions + deletions
    }
  ')
  printf '%d\t%s\t%s\t%s\t%s\t%s\n' \
    "$ordinal" "$sha" "$author_date" "$author" "$counts" "$subject"
}

validate_external_paths() {
  local start_sha=$1
  local source_tip_sha=$2
  local source_entry
  local target_entry
  local path
  local failures=0

  while IFS= read -r -d '' path; do
    source_entry=$(tree_entry "$source_tip_sha" "$path")
    target_entry=$(tree_entry HEAD "$path")

    if [[ -z "$target_entry" ]]; then
      printf 'missing: %s\n' "$path" >&2
      failures=$((failures + 1))
    elif [[ "$source_entry" != "$target_entry" ]]; then
      printf 'content-or-mode mismatch: %s\n' "$path" >&2
      failures=$((failures + 1))
    fi
  done < <(git ls-tree -r --name-only -z "$source_tip_sha")

  while IFS= read -r -d '' path; do
    source_entry=$(tree_entry "$source_tip_sha" "$path")
    [[ -n "$source_entry" ]] && continue

    target_entry=$(tree_entry HEAD "$path")
    if [[ -n "$target_entry" ]]; then
      printf 'should-be-absent: %s\n' "$path" >&2
      failures=$((failures + 1))
    fi
  done < <(git ls-tree -r --name-only -z "$start_sha")

  if ((failures > 0)); then
    printf 'External-managed path validation failed.\n' >&2
    return 1
  fi

  printf 'External-managed paths match the source tip.\n'
}

main() {
  if (($# < 1 || $# > 2)); then
    usage
    exit 2
  fi

  local source_start_input=$1
  local sync_date=${2:-$(date '+%Y-%m-%d')}
  local compact_date
  local source_branch
  local source_ref
  local target_branch
  local target_base_ref='refs/remotes/origin/develop'
  local target_base_sha
  local source_tip_sha
  local source_start_sha
  local merge_sha
  local confirmation
  local ordinal
  local sha
  local commit_shas=()

  if ! validate_date "$sync_date"; then
    die "Invalid date: $sync_date"
  fi
  compact_date=${sync_date//-/}
  source_branch="sync/$sync_date"
  source_ref="refs/remotes/gh/$source_branch"
  target_branch="develop-sync-$compact_date"

  [[ "$source_start_input" =~ ^[0-9a-fA-F]{4,40}$ ]] || die 'Source start must be a Git SHA.'
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die 'Run this script inside a Git working tree.'
  [[ -t 0 && -t 1 ]] || die 'Interactive terminal required.'

  if [[ -n $(git status --porcelain) ]]; then
    die 'Working tree is not clean.'
  fi
  if git show-ref --verify --quiet "refs/heads/$target_branch"; then
    die "Target branch already exists. Refusing to overwrite: $target_branch"
  fi
  git remote get-url origin >/dev/null 2>&1 || die 'Remote origin is not configured.'
  git remote get-url gh >/dev/null 2>&1 || die 'Remote gh is not configured.'

  printf 'Fetching frozen source and target refs...\n'
  git fetch origin '+refs/heads/develop:refs/remotes/origin/develop'
  git fetch gh "+refs/heads/$source_branch:$source_ref"

  target_base_sha=$(git rev-parse --verify "$target_base_ref^{commit}") || die 'Cannot resolve origin/develop.'
  source_tip_sha=$(git rev-parse --verify "$source_ref^{commit}") || die "Cannot resolve gh/$source_branch."
  source_start_sha=$(git rev-parse --verify "$source_start_input^{commit}" 2>/dev/null) || die "Cannot resolve source start SHA: $source_start_input"

  if ! git merge-base --is-ancestor "$source_start_sha" "$source_tip_sha"; then
    die "Source start SHA is not an ancestor of gh/$source_branch."
  fi

  while IFS= read -r sha; do
    [[ -n "$sha" ]] && commit_shas+=("$sha")
  done < <(git rev-list --reverse --topo-order "$source_start_sha..$source_tip_sha")

  if ((${#commit_shas[@]} == 0)); then
    die 'No commits to cherry-pick after the source start SHA.'
  fi

  merge_sha=$(git rev-list --max-count=1 --min-parents=2 "$source_start_sha..$source_tip_sha")
  if [[ -n "$merge_sha" ]]; then
    die "Source range contains merge commits. First merge: $merge_sha"
  fi

  printf '\nTarget base:   origin/develop (%s)\n' "$target_base_sha"
  printf 'Source tip:    gh/%s (%s)\n' "$source_branch" "$source_tip_sha"
  printf 'Target branch: %s\n' "$target_branch"
  printf 'Pending commits: %d\n\n' "${#commit_shas[@]}"
  printf 'No.\tSHA\tAuthor date\tAuthor\tAdditions\tDeletions\tTotal\tSubject\n'
  ordinal=1
  for sha in "${commit_shas[@]}"; do
    print_commit_row "$ordinal" "$sha"
    ordinal=$((ordinal + 1))
  done

  printf '\nType PICK to continue: '
  if ! IFS= read -r confirmation; then
    printf '\nCancelled; no target branch was created.\n'
    exit 0
  fi
  if [[ "$confirmation" != PICK ]]; then
    printf 'Cancelled; no target branch was created.\n'
    exit 0
  fi

  git switch -c "$target_branch" "$target_base_sha"
  if ! git cherry-pick "${commit_shas[@]}"; then
    printf '\nCherry-pick stopped. The target branch and sequencer were preserved.\n' >&2
    printf 'Resolve conflicts, then run: git cherry-pick --continue\n' >&2
    return 1
  fi

  validate_external_paths "$source_start_sha" "$source_tip_sha"
}

main "$@"
