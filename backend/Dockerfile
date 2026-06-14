FROM node:24-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml .npmrc ./
ENV COREPACK_ENABLE_STRICT=0
RUN pnpm install --frozen-lockfile --ignore-scripts && pnpm rebuild bcrypt
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "pnpm drizzle-kit push && node src/index.ts"]

