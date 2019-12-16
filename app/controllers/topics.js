const Topic = require('../models/topics')
const User = require('../models/users')

class TopicsCtrl {
  // 查询话题列表
  async find (ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page, 1)
    ctx.body = await Topic.find({ name: new RegExp(ctx.query.q) }).limit(perPage).skip(page * perPage)
  }

  // 查询特定话题
  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(e => e).map(e => ' +' + e).join('')
    const topic = await Topic.findById(ctx.params.id).select(selectFields)
    if (!topic) {ctx.throw(404, '话题不存在')}
    ctx.body = topic
  }

  // 新建话题
  async create (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    ctx.body = await new Topic(ctx.request.body).save()
  }

  // 修改话题
  async update (ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    ctx.body = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
  }

  // 检测话题是否存在
  async checkTopicExist (ctx, next) {
    const topic = await Topic.findById(ctx.params.id)
    if (!topic) {ctx.throw(404, '话题不存在')}
    await next()
  }

  // 查询话题关注用户列表
  async listTopicFollowers (ctx) {
    ctx.body = await User.find({ followingTopics: ctx.params.id })
  }
}

module.exports = new TopicsCtrl()
