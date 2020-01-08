const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/topics' })
const {
  find, findById, create, update,
  checkTopicExist, listTopicFollowers, listQuestions
} = require('../controllers/topics')
const { secret } = require('../config')
const auth = jwt({ secret })

// 查询话题列表
router.get('/', find)

// 查询特定话题
router.get('/:id', checkTopicExist, findById)

// 新建话题
router.post('/', auth, create)

// 更新话题
router.patch('/:id', auth, checkTopicExist, update)

// 查询话题关注用户列表
router.get('/:id/followers', checkTopicExist, listTopicFollowers)

// 查询话题的问题列表
router.get('/:id/questions', checkTopicExist, listQuestions)

module.exports = router
