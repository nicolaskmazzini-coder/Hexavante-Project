#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "Aplicando schema do banco..."
  ./node_modules/.bin/prisma db push --skip-generate
fi

echo "Iniciando Hexavante..."
exec su-exec nextjs node server.js
