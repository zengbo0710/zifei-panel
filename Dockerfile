# 多阶段构建Dockerfile - 同时处理前端和后端
# 前端构建阶段
FROM node:18-alpine AS frontend-builder
WORKDIR /app/front

# 复制前端依赖文件并安装依赖
COPY front/package.json ./
RUN npm install

# 创建必要的public目录
RUN mkdir -p public

# 复制前端源代码并构建
COPY front/next.config.js ./
COPY front/tailwind.config.js ./
COPY front/postcss.config.js ./
COPY front/src ./src
COPY front/public ./public

# 创建.env.local文件(如果不存在)
RUN touch .env.local && \
    echo "NEXT_PUBLIC_API_URL=/api" > .env.local && \
    echo "NEXT_PUBLIC_UPDATE_INTERVAL=7000" >> .env.local

# 构建前端应用
RUN npm run build

# 服务器阶段: Node.js应用
FROM node:18-alpine
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:3500/api
ENV CORS_ORIGIN=http://localhost:3500

# 复制服务器依赖文件
COPY package.json ./
RUN npm install --production

# 复制服务器代码
COPY server/ ./server/
COPY index.js ./

# 从前端构建阶段复制构建后的前端文件
COPY --from=frontend-builder /app/front/.next ./front/.next
COPY --from=frontend-builder /app/front/public ./front/public
COPY --from=frontend-builder /app/front/node_modules ./front/node_modules
COPY --from=frontend-builder /app/front/package.json ./front/package.json
COPY --from=frontend-builder /app/front/next.config.js ./front/next.config.js

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "index.js"]