#!/usr/bin/env bash
# Corre comandos del frontend (Angular) con un Node compatible.
#   ./run-frontend.sh            -> ng serve en http://localhost:4200
#   ./run-frontend.sh build      -> ng build
# Angular 22 exige Node >= 22.22.3. Si tu Node es más viejo, este script usa uno
# temporal vía npx (no instala nada global). Cuando actualices Node, deja de hacer falta.
set -euo pipefail
cd "$(dirname "$0")/buildiq-frontend"

node_ok() {
  node -e 'const [a,b,c]=process.versions.node.split(".").map(Number);
    process.exit((a>22||(a===22&&(b>22||(b===22&&c>=3)))) ? 0 : 1)' 2>/dev/null
}

run() { if node_ok; then "$@"; else npx --yes -p node@24 -- "$@"; fi; }

[ -d node_modules ] || run npm install
run npx ng "${@:-serve}"
