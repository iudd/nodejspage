document.addEventListener('DOMContentLoaded', () => {
    const messageButton = document.getElementById('getMessage');
    const messageDiv = document.getElementById('message');
    
    messageButton.addEventListener('click', async () => {
        try {
            // 显示加载状态
            messageDiv.style.display = 'block';
            messageDiv.textContent = '加载中...';
            
            // 从API获取数据
            const response = await fetch('/api/hello');
            const data = await response.json();
            
            // 显示消息
            messageDiv.textContent = data.message;
        } catch (error) {
            messageDiv.textContent = '获取消息时出错: ' + error.message;
        }
    });
});