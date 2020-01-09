const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/questions/:questionId/answers' })
const { find, findById, create, update, del, checkAnswerer, checkAnswerExist } = require('../controllers/answers')
const { secret } = require('../config')
const auth = jwt({ secret })

// 查询答案列表
router.get('/', find)

// 查询特定答案
router.get('/:id', checkAnswerExist, findById)

// 新建答案
router.post('/', auth, create)

// 更新答案
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update)

// 删除答案
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del)

module.exports = router
