const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 33559;

// 中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'nordy-ai-automation-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// 获取页面内容
async function fetchPage(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    return cheerio.load(response.data);
  } catch (error) {
    console.error('获取页面失败:', error.message);
    throw error;
  }
}

// API路由
app.get('/api/content', async (req, res) => {
  try {
    const $ = await fetchPage('https://nordy.ai/');
    const pageData = {
      title: $('title').text(),
      // 添加其他需要提取的数据
    };
    res.json({ success: true, data: pageData });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 其他路由...

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});