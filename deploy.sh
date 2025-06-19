#!/bin/bash

# 套利面板一键部署脚本
echo "============================================"
echo "  套利面板前后端一键部署脚本  "
echo "============================================"

# 确保Docker和Docker Compose已安装
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
  echo "错误: 请先安装Docker和Docker Compose"
  exit 1
fi

# 设置环境变量
export COMPOSE_PROJECT_NAME=zifei-panel

# 检查.env文件
if [ ! -f "./front/.env.local" ]; then
  echo "警告: 未找到前端环境配置文件，将创建默认配置..."
  cp "./front/.env.example" "./front/.env.local" 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > "./front/.env.local"
fi

# 停止并移除现有容器
echo "停止并移除现有容器..."
docker-compose down

# 构建和启动容器
echo "构建和启动应用服务..."
docker-compose up --build -d

# 检查服务是否正常启动
echo "检查服务启动状态..."
sleep 5

# 检查后端服务
if docker-compose ps | grep server | grep -q "Up"; then
  echo "✅ 后端服务已成功启动"
else
  echo "❌ 后端服务启动失败，请查看日志排查问题: docker-compose logs server"
fi

# 检查前端服务
if docker-compose ps | grep frontend | grep -q "Up"; then
  echo "✅ 前端服务已成功启动"
else
  echo "❌ 前端服务启动失败，请查看日志排查问题: docker-compose logs frontend"
fi

# 显示访问信息
echo ""
echo "============================================"
echo "🚀 部署完成! 访问地址:"
echo "- 前端 UI: http://localhost:3001"
echo "- 后端 API: http://localhost:3000/api"
echo "============================================"
echo "- 查看日志: docker-compose logs -f"
echo "- 停止服务: docker-compose down"
echo "============================================"