FROM node:24-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml .npmrc ./
ENV COREPACK_ENABLE_STRICT=0
RUN pnpm install --frozen-lockfile --ignore-scripts && pnpm rebuild sharp
COPY . .
RUN pnpm build
EXPOSE 3000
CMD [ "pnpm", "start"]