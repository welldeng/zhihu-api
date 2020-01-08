const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/users' })
const {
  find, findById, create, update, del, login, checkOwner,
  listFollowing, checkUserExist, follow, unfollow, listFollowers,
  followTopic, unfollowTopic, listFollowingTopics, listQuestions,
  followQuestion, unfollowQuestion
} = require('../controllers/users')
const { secret } = require('../config')
const auth = jwt({ secret })
const { checkTopicExist } = require('../controllers/topics')
const { checkQuestionExist } = require('../controllers/questions')

// 查询用户列表
router.get('/', find)

// 查询特定用户
router.get('/:id', findById)

// 新建用户
router.post('/', create)

// 更新用户
router.patch('/:id', auth, checkOwner, update)

// 删除用户
router.delete('/:id', auth, checkOwner, del)

// 登录
router.post('/login', login)

// 查询用户关注列表
router.get('/:id/following', listFollowing)

// 查询用户粉丝列表
router.get('/:id/followers', listFollowers)

// 查询用户话题列表
router.get('/:id/followingTopics', listFollowingTopics)

// 查询用户问题列表
router.get('/:id/questions', listQuestions)

// 关注用户
router.put('/following/:id', auth, checkUserExist, follow)

// 取消关注用户
router.delete('/following/:id', auth, checkUserExist, unfollow)

// 关注话题
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)

// 取消关注话题
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic)

// 关注问题
router.put('/followingQuestions/:id', auth, checkQuestionExist, followQuestion)

// 取消关注问题
router.delete('/followingQuestions/:id', auth, checkQuestionExist, unfollowQuestion)

module.exports = router
