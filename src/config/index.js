import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Конфигурация сервера
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },

    // Конфигурация YandexGPT
    yandexGpt: {
        apiKey: process.env.YANDEX_API_KEY,
        catalogueId: process.env.YANDEX_CATALOGUE_ID,
        modelUrl: process.env.YANDEX_MODEL_URL || 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
        model: process.env.YANDEX_MODEL || 'yandexgpt',

        // Параметры генерации
        completionOptions: {
            stream: false,
            temperature: parseFloat(process.env.TEMPERATURE) || 0.3, // Температура генерации (креативность)
            maxTokens: parseInt(process.env.MAX_TOKENS) || 1024 // Максимальное кол-во токенов в ответе
        }
    },

    // Настройки приложения
    app: {
        corsEnabled: process.env.CORS_ENABLED === 'true',
        logLevel: process.env.LOG_LEVEL || 'info'
    }
};

// Валидация обязательной конфигурации
export const validateConfig = () => {
    const required = {
        'YANDEX_API_KEY': config.yandexGpt.apiKey,
        'YANDEX_CATALOGUE_ID': config.yandexGpt.catalogueId
    };

    const missing = Object.entries(required)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        throw new Error(`Отсутствуют обязательные переменные окружения: ${missing.join(', ')}`);
    }

    return true;
};
