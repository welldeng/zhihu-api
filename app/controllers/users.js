const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const Question = require('../models/questions')
const Answer = require('../models/answers')
const { secret } = require('../config')

class UsersCtrl {
  // 查询用户列表
  async find (ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page, 1)
    ctx.body = await User.find({ name: new RegExp(ctx.query.q) }).limit(perPage).skip(page * perPage)
  }

  // 查询特定用户
  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(e => e).map(e => ' +' + e).join('')
    const populateStr = fields.split(';')
      .filter(e => e)
      .map(e => {
        if (e === 'employments') {
          return 'educations.school educations.major'
        }
        if (e === 'educations') {
          return 'employments.company employments.job'
        }
        return e
      })
      .join(' ')
    const user = await User.findById(ctx.params.id)
      .select(selectFields)
      .populate(populateStr)
    if (!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user
  }

  // 创建用户
  async create (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true }
      // avatar_url: { type: 'string', required: false },
      // gender: { type: 'string', required: false },
      // headline: { type: 'string', required: false },
      // locations: { type: 'array', itemType: 'string', required: false },
      // business: { type: 'string', required: false },
      // employments: { type: 'array', itemType: 'object', required: false },
      // educations: { type: 'array', itemType: 'object', required: false }
    })
    const { name } = ctx.request.body
    const repeatedUser = await User.findOne({ name })
    if (repeatedUser) {ctx.throw(409, '用户已经占用')}
    const user = await new User(ctx.request.body).save()
    if (!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user
  }

  // 检测是否当前用户
  async checkOwner (ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {ctx.throw(403, '没有权限')}
    await next()
  }

  // 更新用户
  async update (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'array', itemType: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false }
    })
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if (!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user
  }

  // 删除用户
  async del (ctx) {
    await User.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }

  //登录
  async login (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true }
    })
    const user = await User.findOne(ctx.request.body)
    if (!user) {ctx.throw(401, '用户名或密码不正确')}
    const { _id, name } = user
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' })
    ctx.body = { token }
  }

  // 查询用户关注列表
  async listFollowing (ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following')
    if (!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user.following
  }

  // 查询用户粉丝列表
  async listFollowers (ctx) {
    ctx.body = await User.find({ following: ctx.params.id })
  }

  // 检测用户是否存在
  async checkUserExist (ctx, next) {
    const user = await User.findById(ctx.params.id)
    if (!user) {ctx.throw(404, '用户不存在')}
    await next()
  }

  // 关注用户
  async follow (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    if (!me.following.map(e => e.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  // 取消关注用户
  async unfollow (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map(e => e.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 查询用户话题列表
  async listFollowingTopics (ctx) {
    const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
    if (!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user.followingTopics
  }

  // 关注话题
  async followTopic (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    if (!me.followingTopics.map(e => e.toString()).includes(ctx.params.id)) {
      me.followingTopics.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  // 取消关注话题
  async unfollowTopic (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    const index = me.followingTopics.map(e => e.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.followingTopics.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 关注问题
  async followQuestion (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingQuestions')
    if (!me.followingQuestions.map(e => e.toString()).includes(ctx.params.id)) {
      me.followingQuestions.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  // 取消关注问题
  async unfollowQuestion (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingQuestions')
    const index = me.followingQuestions.map(e => e.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.followingQuestions.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 查询用户问题列表
  async listQuestions (ctx) {
    ctx.body = await Question.find({ questioner: ctx.params.id })
  }

  // 查询用户赞过的答案列表
  async listLikingAnswers (ctx) {
    const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
    if (!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user.likingAnswers
  }

  // 点赞答案
  async likeAnswer (ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    if (!me.likingAnswers.map(e => e.toString()).includes(ctx.params.id)) {
      me.likingAnswers.push(ctx.params.id)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
    }
    ctx.status = 204
    await next()
  }

  // 取消点赞答案
  async unlikeAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    const index = me.likingAnswers.map(e => e.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.likingAnswers.splice(index, 1)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })
    }
    ctx.status = 204
  }

  // 查询用户踩过的答案列表
  async listDislikingAnswers (ctx) {
    const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
    if (!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user.dislikingAnswers
  }

  // 点踩答案
  async dislikeAnswer (ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    if (!me.dislikingAnswers.map(e => e.toString()).includes(ctx.params.id)) {
      me.dislikingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
    await next()
  }

  // 取消点踩答案
  async undislikeAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    const index = me.dislikingAnswers.map(e => e.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.dislikingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 查询用户收藏的答案列表
  async listCollectingAnswers (ctx) {
    const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers')
    if (!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user.collectingAnswers
  }

  // 收藏答案
  async collectAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
    if (!me.collectingAnswers.map(e => e.toString()).includes(ctx.params.id)) {
      me.collectingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  // 取消收藏答案
  async uncollectAnswer (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
    const index = me.collectingAnswers.map(e => e.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.collectingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 查询用户赞过的评论列表
  async listLikingComments (ctx) {
    const user = await User.findById(ctx.params.id).select('+likingComments').populate('likingComments')
    if (!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user.likingComments
  }

  // 点赞评论
  async likeComment (ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+likingComments')
    if (!me.likingComments.map(e => e.toString()).includes(ctx.params.id)) {
      me.likingComments.push(ctx.params.id)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
    }
    ctx.status = 204
    await next()
  }

  // 取消点赞评论
  async unlikeComment (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+likingComments')
    const index = me.likingComments.map(e => e.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.likingComments.splice(index, 1)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })
    }
    ctx.status = 204
  }

  // 查询用户踩过的评论列表
  async listDislikingComments (ctx) {
    const user = await User.findById(ctx.params.id).select('+dislikingComments').populate('dislikingComments')
    if (!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user.dislikingComments
  }

  // 点踩评论
  async dislikeComment (ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingComments')
    if (!me.dislikingComments.map(e => e.toString()).includes(ctx.params.id)) {
      me.dislikingComments.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
    await next()
  }

  // 取消点踩评论
  async undislikeComment (ctx) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingComments')
    const index = me.dislikingComments.map(e => e.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.dislikingComments.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
}

module.exports = new UsersCtrl()
