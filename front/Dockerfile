FROM node:18-alpine

WORKDIR /app

# 创建必要的目录
RUN mkdir -p ./public

# 复制package.json和安装依赖
COPY package.json ./
RUN npm install

# 复制前端源码
COPY . .

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 构建应用
RUN npm run build

# 暴露前端端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "start"]