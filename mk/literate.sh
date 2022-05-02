#!/bin/bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"/..
ROOTDIR=$(pwd)

literate_run() {
  if [[ $1 =~ .*\.ts ]]; then
    echo -e '\n\e[96m'RUNNING $1'\e[39m'
    pushd $(dirname $1) >/dev/null
    FILE=$(basename $1)
  elif [[ -f $1/README.md ]]; then
    echo -e '\n\e[96m'RUNNING EXAMPLES IN ${1%/}/README.md'\e[39m'
    pushd $1 >/dev/null
    FILE=README.md
  fi
  export TS_CONFIG_PATH=$ROOTDIR/mk/tsconfig-literate.json
  node --loader $ROOTDIR/mk/loader.mjs --experimental-specifier-resolution=node $FILE
  popd >/dev/null
}

if [[ ${1:-} == lint ]]; then
  trap "sed -i '/README.md.ts/ s/^#*\s*//' .gitignore" EXIT
  sed -i '/README.md.ts/ s/^/# /' .gitignore
  for F in $(grep -l '```ts' packages/*/README.md); do
    codedown ts <$F >$F.ts
  done
  xo-yoursunny packages/*/README.md.ts
  exit
fi

if [[ -n ${1:-} ]]; then
  literate_run $1
  exit
fi

for F in $(grep -l '```ts' packages/*/README.md); do
  literate_run $(dirname $F)
done
