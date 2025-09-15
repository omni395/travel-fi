#!/bin/bash

# Проверяем, передан ли аргумент
if [ -z "$1" ]; then
  echo "Выберите режим запуска:"
  echo "1) Полная очистка и запуск с пересборкой"
  echo "2) Запуск существующего образа"
  read -r -p "Введите 1 или 2: " choice
else
  choice="$1"
fi

case $choice in
  1)
    echo "Запускаем полную очистку и пересборку..."
    # Остановка и удаление всех контейнеров
    docker compose down --remove-orphans
    # Удаление всех неиспользуемых томов
    docker volume rm $(docker volume ls -q -f dangling=true) 2>/dev/null || true
    # Очистка кэша сборки
    docker builder prune -a -f
    # Удаление всех неиспользуемых образов
    docker image prune -a -f
    # Удаление локальных файлов
    sudo rm -rf ./.nuxt ./node_modules ./package-lock.json
    # Запуск с пересборкой
    docker compose up --build --force-recreate
    ;;
  2)
    echo "Запускаем существующий образ..."
    # Остановка и удаление всех контейнеров
    docker compose down --remove-orphans
    # Запуск без пересборки
    docker compose up
    ;;
  *)
    echo "Ошибка: выберите 1 (очистка и билд) или 2 (запуск готового образа)"
    exit 1
    ;;
esac
