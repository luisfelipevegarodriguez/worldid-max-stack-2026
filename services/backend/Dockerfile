FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
COPY services/backend/ ./services/backend/
COPY prisma/ ./prisma/
RUN npm ci --workspace=services/backend
RUN npx prisma generate
RUN npm run build --workspace=services/backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/services/backend/.next ./.next
COPY --from=builder /app/services/backend/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/backend/package.json ./package.json
EXPOSE 8080
ENV PORT=8080
CMD ["node_modules/.bin/next", "start", "-p", "8080"]
