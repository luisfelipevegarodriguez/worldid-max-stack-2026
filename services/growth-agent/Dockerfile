FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
COPY services/growth-agent/ ./services/growth-agent/
COPY prisma/ ./prisma/
RUN npm ci --workspace=services/growth-agent
RUN npx prisma generate
RUN npm run build --workspace=services/growth-agent 2>/dev/null || true

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/services/growth-agent ./services/growth-agent
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
EXPOSE 8080
ENV PORT=8080
CMD ["node", "services/growth-agent/dist/index.js"]
