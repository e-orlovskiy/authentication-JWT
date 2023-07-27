const Router = require('express').Router
const userController = require('../controllers/user-controller')
const router = new Router()
const { body } = require('express-validator')
const authMiddleware = require('../middlewares/auth-middleware')

router.post('/registration',
  body('email')
    .isEmail()
    .withMessage('Некорректный email'),
  body('password')
    .isLength({ min: 3, max: 16 })
    .withMessage('Пароль должен быть от 3 до 16 символов')
    .matches(/[A-Z]/)
    .withMessage('Пароль должен содержать как минимум одну заглавную букву'),
  userController.registration
);
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.post('/addTodo', authMiddleware, userController.addNewTodo)
router.get('/activate/:link', userController.activate)
router.get('/refresh', userController.refresh)
router.get('/todos', authMiddleware, userController.getTodos)

module.exports = router