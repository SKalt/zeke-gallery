#!/usr/bin/env bash
## USAGE: deploy.sh [-h|--help] [--live|--dry-run]
## deploy the zeke gallery webpage HTML/JS/CSS to kaltfam.net
usage() { grep -e '^##' "$0" | sed '/^## //g'; }
get_repo_root() { git rev-parse --show-toplevel; }

get_username() {
  local user="${ZEKE_GALLERY_USER:-}";
  if [ -z "$user" ]; then
    printf "username: " >&2;
    read -r user
  fi
  echo "$user"
}

deploy() {
  local host=kaltfam.net
  local user; user="$(get_username)"
  local repo_root; repo_root="$(get_repo_root)"
  local live="${1:-}"
  if [ "$live" = "true" ]; then
    scp \
      "$repo_root/zeke/index.html" "$repo_root/zeke/gallery.js" \
      "$user@$host:/home/$user/kaltfam.net/zeke/"
  else
    echo "would deploy:
    $repo_root/zeke/index.html -> $user@$host:/home/$user/kaltfam.net/zeke/index.html
    $repo_root/zeke/gallery.js -> $user@$host:/home/$user/kaltfam.net/zeke/gallery.js"
  fi
}

main() {
  set -euo pipefail
  local live="false";
  while [ -n "${1:-}" ]; do
    case "$1" in
    --live)    live=true;  shift;;
    --dry-run) live=false; shift;;
    -h|--help) usage && exit 0;;
    *)         usage && exit 1;;
    esac
  done

  deploy "$live"
}

if [ "${BASH_SOURCE[0]}" = "$0" ]; then main "$@"; fi
