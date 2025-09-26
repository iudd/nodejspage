const express = require('express');
const path = require('path');
const { chromium } = require('playwright');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const bodyParser = require('body-parser');

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 33559;

// 中间件设置
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'nordy-ai-automation-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // 在生产环境中设置为true
}));

// 存储浏览器实例和页面
let browser = null;
let context = null;
let page = null;
let isLoggedIn = false;
let sessionCookies = [];

// 初始化浏览器
async function initBrowser() {
  if (!browser) {
    console.log('正在启动浏览器...');
    browser = await chromium.launch({
      headless: false, // 设置为true可以在后台运行
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ]
    });
    console.log('浏览器已启动');
  }
  return browser;
}

// 获取新页面
async function getPage() {
  if (!browser) {
    await initBrowser();
  }
  
  if (!context) {
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    // 如果有保存的cookies，加载它们
    if (sessionCookies.length > 0) {
      await context.addCookies(sessionCookies);
    }
  }
  
  if (!page) {
    page = await context.newPage();
  }
  
  return page;
}

// 关闭浏览器
async function closeBrowser() {
  if (browser) {
    if (context) await context.close();
    await browser.close();
    browser = null;
    context = null;
    page = null;
    console.log('浏览器已关闭');
  }
}

// 保存cookies
async function saveCookies() {
  if (context) {
    sessionCookies = await context.cookies();
    fs.writeFileSync('cookies.json', JSON.stringify(sessionCookies));
    console.log('Cookies已保存');
  }
}

// 加载cookies
function loadCookies() {
  try {
    if (fs.existsSync('cookies.json')) {
      const cookiesStr = fs.readFileSync('cookies.json', 'utf8');
      sessionCookies = JSON.parse(cookiesStr);
      console.log('Cookies已加载');
      return true;
    }
  } catch (error) {
    console.error('加载cookies失败:', error);
  }
  return false;
}

// 检查登录状态
async function checkLoginStatus() {
  const page = await getPage();
  await page.goto('https://nordy.ai/', { waitUntil: 'networkidle' });
  
  // 检查是否有登录状态的元素
  // 注意：这里需要根据实际网站调整选择器
  const isLoggedIn = await page.evaluate(() => {
    // 例如，检查是否有用户头像或用户名显示
    return document.querySelector('.user-avatar') !== null || 
           document.querySelector('.user-name') !== null;
  });
  
  return isLoggedIn;
}

// Google登录
async function googleLogin(email, password) {
  try {
    const page = await getPage();
    
    // 访问Nordy.ai
    await page.goto('https://nordy.ai/', { waitUntil: 'networkidle' });
    
    // 点击登录按钮（需要根据实际网站调整选择器）
    await page.waitForSelector('.login-button', { timeout: 5000 });
    await page.click('.login-button');
    
    // 点击Google登录选项（需要根据实际网站调整选择器）
    await page.waitForSelector('.google-login', { timeout: 5000 });
    await page.click('.google-login');
    
    // 等待Google登录页面加载
    await page.waitForLoadState('networkidle');
    
    // 输入Google邮箱
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.fill('input[type="email"]', email);
    await page.click('#identifierNext');
    
    // 输入Google密码
    await page.waitForSelector('input[type="password"]', { state: 'visible', timeout: 5000 });
    await page.fill('input[type="password"]', password);
    await page.click('#passwordNext');
    
    // 等待重定向回Nordy.ai
    await page.waitForLoadState('networkidle');
    
    // 保存cookies
    await saveCookies();
    
    isLoggedIn = true;
    return { success: true, message: '登录成功' };
  } catch (error) {
    console.error('登录失败:', error);
    return { success: false, message: `登录失败: ${error.message}` };
  }
}

// 路由设置
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API路由

// 初始化浏览器
app.get('/api/init', async (req, res) => {
  try {
    await initBrowser();
    res.json({ success: true, message: '浏览器已初始化' });
  } catch (error) {
    res.status(500).json({ success: false, message: `初始化失败: ${error.message}` });
  }
});

// 关闭浏览器
app.get('/api/close', async (req, res) => {
  try {
    await closeBrowser();
    res.json({ success: true, message: '浏览器已关闭' });
  } catch (error) {
    res.status(500).json({ success: false, message: `关闭失败: ${error.message}` });
  }
});

// 检查登录状态
app.get('/api/check-login', async (req, res) => {
  try {
    const loginStatus = await checkLoginStatus();
    res.json({ success: true, isLoggedIn: loginStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: `检查登录状态失败: ${error.message}` });
  }
});

// Google登录
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '邮箱和密码不能为空' });
  }
  
  try {
    const result = await googleLogin(email, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: `登录失败: ${error.message}` });
  }
});

// 访问特定页面
app.post('/api/navigate', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ success: false, message: 'URL不能为空' });
  }
  
  try {
    const page = await getPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // 获取页面内容
    const content = await page.content();
    
    res.json({ success: true, message: '页面访问成功', content });
  } catch (error) {
    res.status(500).json({ success: false, message: `页面访问失败: ${error.message}` });
  }
});

// 点击元素
app.post('/api/click', async (req, res) => {
  const { selector } = req.body;
  
  if (!selector) {
    return res.status(400).json({ success: false, message: '选择器不能为空' });
  }
  
  try {
    const page = await getPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    
    res.json({ success: true, message: '点击成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: `点击失败: ${error.message}` });
  }
});

// 输入文本
app.post('/api/type', async (req, res) => {
  const { selector, text } = req.body;
  
  if (!selector || !text) {
    return res.status(400).json({ success: false, message: '选择器和文本不能为空' });
  }
  
  try {
    const page = await getPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.fill(selector, text);
    
    res.json({ success: true, message: '输入成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: `输入失败: ${error.message}` });
  }
});

// 获取页面内容
app.get('/api/content', async (req, res) => {
  try {
    const page = await getPage();
    const content = await page.content();
    
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: `获取内容失败: ${error.message}` });
  }
});

// 获取页面截图
app.get('/api/screenshot', async (req, res) => {
  try {
    const page = await getPage();
    const screenshot = await page.screenshot();
    
    res.json({ success: true, screenshot: `data:image/png;base64,${screenshot.toString('base64')}` });
  } catch (error) {
    res.status(500).json({ success: false, message: `截图失败: ${error.message}` });
  }
});

// 执行自定义JavaScript
app.post('/api/evaluate', async (req, res) => {
  const { script } = req.body;
  
  if (!script) {
    return res.status(400).json({ success: false, message: '脚本不能为空' });
  }
  
  try {
    const page = await getPage();
    const result = await page.evaluate(script);
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: `执行脚本失败: ${error.message}` });
  }
});

// 贪吃蛇游戏路由
app.get('/snake', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'snake.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  
  // 尝试加载保存的cookies
  loadCookies();
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  await closeBrowser();
  process.exit();
});