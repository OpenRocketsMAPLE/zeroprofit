FROM node:22-alpine AS build
WORKDIR /app
COPY source.b64.* /tmp/source-parts/
RUN cat /tmp/source-parts/source.b64.* | tr -d '\n\r' | base64 -d > /tmp/source.tar.gz \
 && echo "5c64b31bcc97bd61ea9186988b9b0799a4f4daafb041a8249c0d2eb1d9a67094  /tmp/source.tar.gz" | sha256sum -c - \
 && tar -xzf /tmp/source.tar.gz -C /app \
 && rm -rf /tmp/source.tar.gz /tmp/source-parts
RUN sed -i 's/function guildSafe(command: Record<string, unknown>)/function guildSafe(command: any)/' src/commands.ts
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
