# ==============================================================================
# Dockerfile لمنظومة جهاز الإشراف والمتابعة
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# نسخ تعريفات الحزم وتثبيتها
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# نسخ كود الخادم والواجهة الأمامية الجاهزة
COPY server ./server
COPY public_html ./public_html

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server/src/index.js"]
