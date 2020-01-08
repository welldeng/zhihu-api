const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/users' })
const {
  find, findById, create, update, del, login, checkOwner,
  listFollowing, checkUserExist, follow, unfollow, listFollowers,
  listFollowingTopics, followTopic, unfollowTopic,
  listQuestions, followQuestion, unfollowQuestion,
  listLikingAnswers, likeAnswer, unlikeAnswer,
  listDislikingAnswers, dislikeAnswer, undislikeAnswer,
  listCollectingAnswers, collectAnswer, uncollectAnswer
} = require('../controllers/users')
const { secret } = require('../config')
const auth = jwt({ secret })
const { checkTopicExist } = require('../controllers/topics')
const { checkQuestionExist } = require('../controllers/questions')
const { checkAnswerExist } = require('../controllers/answers')

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

// 查询用户点赞答案列表
router.get('/:id/likingAnswers', listLikingAnswers)

// 查询用户点踩答案列表
router.get('/:id/dislikingAnswers', listDislikingAnswers)

// 查询用户收藏答案列表
router.get('/:id/collectingAnswers', listCollectingAnswers)

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

// 点赞答案
router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer)

// 取消点赞答案
router.delete('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer)

// 点踩答案
router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer)

// 取消点踩答案
router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, undislikeAnswer)

// 收藏答案
router.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswer)

// 取消收藏答案
router.delete('/collectingAnswers/:id', auth, checkAnswerExist, uncollectAnswer)

module.exports = router
