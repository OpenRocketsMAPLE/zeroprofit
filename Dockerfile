FROM node:22-alpine AS build
WORKDIR /app
COPY source.tar.gz /tmp/source.tar.gz
RUN tar -xzf /tmp/source.tar.gz -C /app && rm /tmp/source.tar.gz
RUN npm ci --ignore-scripts
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["npm", "start"]
