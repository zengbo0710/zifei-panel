FROM node:18-alpine

WORKDIR /app

# 创建必要的目录
RUN mkdir -p ./public

# 安装依赖
COPY ./front/package.json ./
RUN npm install

# 复制所有前端代码和配置
COPY ./front/next.config.js ./
COPY ./front/tailwind.config.js ./
COPY ./front/postcss.config.js ./
COPY ./front/src ./src
COPY ./front/public ./public
COPY ./front/.env* ./

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 构建应用
RUN npm run build

# 暴露前端端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "start"]