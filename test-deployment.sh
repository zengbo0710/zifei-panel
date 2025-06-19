#!/bin/bash

# 套利面板本地Docker部署测试脚本
echo "==========================================================="
echo "     套利面板前后端Docker部署测试脚本     "
echo "==========================================================="

# 确保Docker和Docker Compose已安装
if ! command -v docker &> /dev/null; then
  echo "错误: Docker未安装，请先安装Docker"
  exit 1
fi

if ! docker compose version &> /dev/null && ! docker-compose version &> /dev/null; then
  echo "错误: Docker Compose未安装，请先安装Docker Compose"
  exit 1
fi

# 使用docker compose命令（新版）或docker-compose（旧版）
if docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  DOCKER_COMPOSE="docker-compose"
fi

echo "使用命令: $DOCKER_COMPOSE"

# 设置环境变量
export COMPOSE_PROJECT_NAME=zifei-panel-test

echo "1. 检查环境配置文件..."
# 检查前端环境配置
if [ ! -f "./front/.env.local" ]; then
  echo "  创建默认前端环境配置..."
  cp "./front/.env.example" "./front/.env.local" 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > "./front/.env.local"
fi

echo "2. 停止并移除现有测试容器..."
$DOCKER_COMPOSE down

echo "3. 开始构建镜像..."
$DOCKER_COMPOSE build

echo "4. 启动服务..."
$DOCKER_COMPOSE up -d

echo "5. 等待服务启动..."
sleep 10

echo "6. 检查服务状态..."
echo "后端服务状态:"
if $DOCKER_COMPOSE ps server | grep -q "Up"; then
  echo "  ✅ 后端服务已成功启动"
else
  echo "  ❌ 后端服务启动失败"
  echo "  查看日志: $DOCKER_COMPOSE logs server"
fi

echo "前端服务状态:"
if $DOCKER_COMPOSE ps frontend | grep -q "Up"; then
  echo "  ✅ 前端服务已成功启动"
else
  echo "  ❌ 前端服务启动失败"
  echo "  查看日志: $DOCKER_COMPOSE logs frontend"
fi

echo "7. 测试API连接..."
if curl -s http://localhost:3000/api/status > /dev/null; then
  echo "  ✅ API连接正常"
else
  echo "  ❌ API连接失败"
fi

echo "8. 测试前端页面..."
if curl -s http://localhost:3001 > /dev/null; then
  echo "  ✅ 前端页面访问正常"
else
  echo "  ❌ 前端页面访问失败"
fi

echo "==========================================================="
echo "测试完成，服务访问地址:"
echo "- 前端UI: http://localhost:3001"
echo "- 后端API: http://localhost:3000/api"
echo "==========================================================="
echo "其他常用命令:"
echo "- 查看日志: $DOCKER_COMPOSE logs -f"
echo "- 停止服务: $DOCKER_COMPOSE down"
echo "- 重启服务: $DOCKER_COMPOSE restart"
echo "==========================================================="