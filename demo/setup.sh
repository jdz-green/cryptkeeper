#!/bin/bash
# Recreate the three demo projects with real, backdated git history.
# The fixtures are committed; the repositories are not, so cloning stays clean.
set -e
cd "$(dirname "$0")"
rm -rf repos && mkdir -p repos
C='git -c commit.gpgsign=false -c user.name=x -c user.email=x@x'
make_repo() {
  local name="$1" spec="$2"
  cp -R "fixtures/$name" "repos/$name"
  git -C "repos/$name" init -q
  git -C "repos/$name" add -A
  GIT_AUTHOR_DATE="$spec" GIT_COMMITTER_DATE="$spec" $C -C "repos/$name" commit -qm "$name"
}
make_repo tombstone-todo "2024-06-01T10:00:00"
make_repo fading-api     "2026-05-01T10:00:00"
make_repo alive-tool     "2026-11-24T10:00:00"
echo "demo repos ready in demo/repos"
