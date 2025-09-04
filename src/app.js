import express from 'express';
import conversationRoutes from './routes/conversation.routes.js';
import { config } from './config/index.js';

// Создание Express приложения
const app = express();

// Middleware промежуточные обработчики
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка CORS (если включено)
if (config.app.corsEnabled) {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });
}

// Middleware для логирования запросов
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Эндпоинт проверки состояния
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.server.env,
        version: process.env.npm_package_version || '0.1.0'
    });
});

// Эндпоинт информации об API
app.get('/api/info', (req, res) => {
    res.json({
        name: 'YandexGPT Node.js Server',
        version: process.env.npm_package_version || '0.1.0',
        endpoints: [
            { method: 'GET', path: '/', description: 'Просмотр истории диалога (HTML)' },
            { method: 'GET', path: '/health', description: 'Проверка состояния' },
            { method: 'GET', path: '/api/info', description: 'Информация об API' },
            { method: 'POST', path: '/conversation', description: 'Отправить сообщение в YandexGPT' },
            { method: 'POST', path: '/conversation/reset', description: 'Сбросить историю диалога' },
            { method: 'GET', path: '/conversation/history', description: 'Получить историю диалога (JSON)' }
        ],
        model: config.yandexGpt.model,
        environment: config.server.env
    });
});

// Подключение маршрутов диалогов
app.use('/', conversationRoutes);

// Обработчик 404 ошибки
app.use((req, res) => {
    res.status(404).json({
        error: 'Не найдено',
        message: `Запрашиваемый ресурс ${req.path} не найден`,
        timestamp: new Date().toISOString()
    });
});

// Middleware для обработки ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Внутренняя ошибка сервера',
        code: err.code || 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
        ...(config.server.env === 'development' && { stack: err.stack })
    });
});

export default app;
