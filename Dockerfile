#building
FROM node:24-alpine AS build-stage
# Ứng dụng
WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

#development
FROM node:24-alpine AS prod-stage

COPY --from=build-stage /app/dist /app 
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm install --production

EXPOSE 3005

VOLUME [ "/app" ]

CMD ["node", "/app/main.js"]