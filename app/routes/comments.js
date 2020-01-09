const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/questions/:questionId/answers/:answerId/comments' })
const { find, findById, create, update, del, checkCommentator, checkCommentExist } = require('../controllers/comments')
const { secret } = require('../config')
const auth = jwt({ secret })

// 查询评论列表
router.get('/', find)

// 查询特定评论
router.get('/:id', checkCommentExist, findById)

// 新建评论
router.post('/', auth, create)

// 更新评论
router.patch('/:id', auth, checkCommentExist, checkCommentator, update)

// 删除评论
router.delete('/:id', auth, checkCommentExist, checkCommentator, del)

module.exports = router
