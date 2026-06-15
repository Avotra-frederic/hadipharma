FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.bin ./node_modules/.bin
EXPOSE 3000
CMD ["npm", "start"]
