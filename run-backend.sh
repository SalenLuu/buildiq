#!/usr/bin/env bash
# Arranca la API de Spring Boot en http://localhost:8080
# Lee DB_USER, DB_PASSWORD y DB_NAME de backend.secrets (archivo local, NO se sube a git).
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -f backend.secrets ]; then
  echo "Falta backend.secrets. Créalo con:"
  echo "  export DB_USER=tu_usuario"
  echo "  export DB_PASSWORD=tu_contraseña"
  echo "  export DB_NAME=salenluu_inventario_obra"
  exit 1
fi
set -a
source backend.secrets
set +a
cd buildiq-backend
exec mvn spring-boot:run
