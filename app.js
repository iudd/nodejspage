const express = require('express');
const path = require('path');

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 33559;

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 路由设置
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/hello', (req, res) => {
  res.json({ message: '你好，世界！' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});