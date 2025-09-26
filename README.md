# Nordy.ai 自动化访问工具 (nodejspage)

这是一个Node.js应用程序，可以自动化访问Nordy.ai网站，进行Google登录，获取网站信息，并提供API接口让外部访问来模拟人类操作。

## 功能特点

- 自动访问Nordy.ai网站
- 支持Google账号登录
- 模拟人类操作（点击、输入、导航等）
- 获取页面截图和HTML内容
- 提供RESTful API接口
- 直观的Web控制界面

## 安装

```bash
# 克隆仓库
git clone https://github.com/iudd/nodejspage.git
cd nodejspage

# 安装依赖
npm install
```

## 使用方法

```bash
# 启动应用
node app.js
```

然后在浏览器中访问 http://localhost:33559

## API接口

应用提供了以下API接口：

- `GET /api/init` - 初始化浏览器
- `GET /api/close` - 关闭浏览器
- `GET /api/check-login` - 检查登录状态
- `POST /api/login` - Google登录
- `POST /api/navigate` - 访问指定URL
- `POST /api/click` - 点击页面元素
- `POST /api/type` - 输入文本
- `GET /api/content` - 获取页面HTML内容
- `GET /api/screenshot` - 获取页面截图
- `POST /api/evaluate` - 执行自定义JavaScript

## 许可证

MIT