#!/usr/bin/env node

import dotenv from 'dotenv';
import axios from 'axios';
import { config, validateConfig } from '../src/config/index.js';
import { axiosInstance } from '../src/utils/axiosClient.js';

dotenv.config();

console.log('🔍 Проверка конфигурации YandexGPT сервера...\n');
console.log('='.repeat(50));

// Проверка переменных окружения
console.log('📋 Переменные окружения:');
console.log('-'.repeat(50));

const envVars = [
    { name: 'YANDEX_API_KEY', value: process.env.YANDEX_API_KEY, sensitive: true },
    { name: 'YANDEX_CATALOGUE_ID', value: process.env.YANDEX_CATALOGUE_ID, sensitive: false },
    { name: 'YANDEX_MODEL_URL', value: process.env.YANDEX_MODEL_URL, sensitive: false },
    { name: 'YANDEX_MODEL', value: process.env.YANDEX_MODEL || 'yandexgpt', sensitive: false },
    { name: 'PORT', value: process.env.PORT || '3000', sensitive: false },
    { name: 'NODE_ENV', value: process.env.NODE_ENV || 'development', sensitive: false }
];

let hasErrors = false;

envVars.forEach(({ name, value, sensitive }) => {
    if (value) {
        const displayValue = sensitive ?
            value.substring(0, 10) + '...' + value.substring(value.length - 4) :
            value;
        console.log(`✅ ${name}: ${displayValue}`);
    } else {
        console.log(`❌ ${name}: Не установлено`);
        if (name.startsWith('YANDEX_API') || name === 'YANDEX_CATALOGUE_ID') {
            hasErrors = true;
        }
    }
});

console.log('\n' + '='.repeat(50));
console.log('🔧 Валидация конфигурации:');
console.log('-'.repeat(50));

try {
    validateConfig();
    console.log('✅ Все необходимые значения конфигурации присутствуют');
} catch (error) {
    console.log(`❌ Ошибка валидации конфигурации: ${error.message}`);
    hasErrors = true;
}

// Тестирование подключения к API, если конфигурация валидна
if (!hasErrors && process.env.YANDEX_API_KEY && process.env.YANDEX_CATALOGUE_ID) {
    console.log('\n' + '='.repeat(50));
    console.log('🌐 Тестирование подключения к YandexGPT API:');
    console.log('-'.repeat(50));

    const testRequest = {
        modelUri: `gpt://${process.env.YANDEX_CATALOGUE_ID}/yandexgpt-lite`,
        completionOptions: {
            stream: false,
            temperature: 0.1,
            maxTokens: 50
        },
        messages: [
            { role: "system", text: "Ты полезный ассистент" },
            { role: "user", text: "Скажи 'Подключение к API успешно' в ответе" }
        ]
    };

    try {
        const response = await axiosInstance.post("", testRequest);

        if (response.data && response.data.result) {
            console.log('✅ Подключение к API: Успешно');
            console.log('✅ Ответ получен от YandexGPT');
            console.log(`   Версия модели: ${response.data.result.modelVersion || 'неизвестно'}`);
        }
    } catch (error) {
        console.log('❌ Подключение к API: Не удалось');
        if (error.response) {
            console.log(`   Статус: ${error.response.status}`);
            console.log(`   Ошибка: ${JSON.stringify(error.response.data)}`);

            if (error.response.status === 401) {
                console.log('\n   💡 Подсказка: Проверьте, правильный ли ваш API ключ и активен ли он');
            } else if (error.response.status === 403) {
                console.log('\n   💡 Подсказка: Проверьте, есть ли у вашего сервисного аккаунта необходимые разрешения');
            }
        } else {
            console.log(`   Ошибка: ${error.message}`);
        }
        hasErrors = true;
    }
}

// Итоги
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ Проверка конфигурации завершена с ошибками');
    console.log('\nПожалуйста, исправьте ошибки выше и запустите эту проверку снова.');
    process.exit(1);
} else {
    console.log('✅ Проверка конфигурации завершена успешно!');
    console.log('\nВаш сервер готов к запуску. Запустите: npm start');
    process.exit(0);
}
