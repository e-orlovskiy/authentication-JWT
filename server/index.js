require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error-middleware')

const DB_URL = process.env.DB_URL
const PORT = process.env.PORT
const app = express()

app.use(express.json())
// позволяет вашему автоматически разбирать тело запроса в формате JSON. 
// анализирует тело запроса, извлекает данные JSON и делает их доступными в виде объекта req.body
// для обработки коде.

app.use(cookieParser())
// позволяет легко работать с куками (cookies). Cookie-parser разбирает заголовок запроса и извлекает 
// информацию о куках. Затем он делает эту информацию доступной в виде объекта req.cookies в коде, позволяя
// легко читать и устанавливать значения кук.

const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500'];
app.use(cors({
  origin: function (origin, callback) {
    // Проверяем, если источник запроса есть в списке разрешенных
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Важно: устанавливаем credentials в true для передачи куки
}));
// позволяет серверу обрабатывать запросы с других доменов или портов. Middleware cors добавляет 
// соответствующие заголовки к ответам сервера, чтобы разрешить запросы с других доменов. Это важно для 
// обеспечения безопасности и разрешения взаимодействия между клиентской и серверной сторонами, когда они 
// находятся на разных доменах.

app.use('/api', router)
// Использование /api в URL позволяет создать четкую идентификацию для маршрутов, которые предназначены для 
// работы с вашим API, отличая их от других маршрутов, которые могут быть настроены для других частей вашего 
// приложения, таких как страницы веб-сайта.

app.use(errorMiddleware)
// ВАЖНО, ЧТОБЫ ОН БЫЛ ПОСЛЕДНИМ

const start = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    app.listen(PORT, () => { console.log(`server started on port: ${PORT}`) })
  } catch (err) {
    console.log(err)
  }
}

start()