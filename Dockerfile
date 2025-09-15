FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# Очищаем кэш npm и устанавливаем зависимости
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
