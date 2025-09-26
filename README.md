# Nordy.ai 数据访问工具 (纯Node.js版)

这是一个基于Node.js的应用程序，通过HTTP请求获取Nordy.ai网站数据，无需浏览器自动化。

## 功能特点

- 使用axios发送HTTP请求获取页面内容
- 使用cheerio解析HTML数据
- 提供简洁的API接口
- 轻量级，无需浏览器依赖

## 安装

```bash
# 克隆仓库
git clone https://github.com/iudd/nodejspage.git
cd nodejspage

# 安装依赖
npm install

# 配置环境变量（可选）
cp .env.example .env
# 在.env文件中配置必要的变量
```

## 使用方法

```bash
# 启动应用
node app.js

# 开发模式（需安装nodemon）
npm run dev
```

应用启动后访问：http://localhost:33559

## API接口

### 获取页面内容
`GET /api/content`  
参数：无  
返回：页面HTML内容

### 模拟登录
`POST /api/login`  
参数：
```json
{
  "email": "您的邮箱",
  "password": "您的密码"
}
```
返回：登录结果

## 配置说明

在`.env`文件中可以配置以下参数：
```
API_BASE_URL=https://nordy.ai
REQUEST_TIMEOUT=5000
```

## 注意事项

1. 此方案无法执行JavaScript渲染的页面
2. 如果网站有反爬机制，可能需要：
   - 添加更多请求头
   - 使用代理IP
   - 实现验证码处理

## 问题反馈

遇到问题请提交Issue：
https://github.com/iudd/nodejspage/issues

## 许可证

MIT