FROM node:18-alpine

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 复制package文件并安装依赖
COPY package*.json ./
RUN npm ci --production

# 复制服务器代码
COPY server/ ./server/
COPY index.js ./

# 暴露服务器端口
EXPOSE 3000

# 启动命令
CMD ["node", "index.js"]