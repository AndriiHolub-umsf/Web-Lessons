const http = require('http'); // Импорт модуля http для создания веб-сервера
const url = require('url'); // Импорт модуля url для парсинга URL и query-параметров
const port = 3000; // Определение порта, на котором будет работать сервер

// Создание HTTP-сервера с обработчиком запросов
const server = http.createServer((req, res) => {
    
    // Добавление заголовков CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    // Разбор URL запроса с учетом query-параметров
    const parsedUrl = url.parse(req.url, true);
    // Получение query-параметров из URL
    const query = parsedUrl.query;

    // Проверка, что запрос направлен на маршрут /sum и использует метод GET
    if (parsedUrl.pathname === '/sum' && req.method === 'GET') {
        // Извлечение параметра a из query и преобразование в число
        const a = parseFloat(query.a);
        // Извлечение параметра b из query и преобразование в число
        const b = parseFloat(query.b);

        // Проверка, являются ли a и b валидными числами
        if (isNaN(a) || isNaN(b)) {
            // Установка кода состояния 400 (Bad Request) для некорректных данных
            res.statusCode = 400;
            // Установка заголовка Content-Type для ответа в формате JSON
            res.setHeader('Content-Type', 'application/json');
            // Отправка ответа с сообщением об ошибке и завершение ответа
            res.end(JSON.stringify({
                error: 'Parameters "a" and "b" must be valid numbers'
            }));
            // Прерывание выполнения функции
            return;
        }

        // Вычисление суммы чисел a и b
        const sum = a + b;

        // Установка кода состояния 200 (OK) для успешного ответа
        res.statusCode = 200;
        // Установка заголовка Content-Type для ответа в формате JSON
        res.setHeader('Content-Type', 'application/json');
        // Отправка ответа с параметрами a, b и их суммой в формате JSON
        res.end(JSON.stringify({
            a: a,
            b: b,
            sum: sum
        }));
    } else {
        // Установка кода состояния 404 (Not Found) для неизвестных маршрутов
        res.statusCode = 404;
        // Установка заголовка Content-Type для ответа в формате JSON
        res.setHeader('Content-Type', 'application/json');
        // Отправка ответа с сообщением об ошибке для неверного маршрута
        res.end(JSON.stringify({
            error: 'Route not found. Use /sum?a=<number>&b=<number>'
        }));
    }
});

// Запуск сервера на указанном порту с выводом сообщения в консоль
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});