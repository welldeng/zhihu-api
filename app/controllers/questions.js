const Question = require('../models/questions')

// const User = require('../models/users')

class QuestionsCtrl {
  // 查询问题列表
  async find (ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page, 1)
    const q = new RegExp(ctx.query.q)
    ctx.body = await Question.find({ $or: [ { title: q }, { description: q } ] })
      .limit(perPage)
      .skip(page * perPage)
  }

  // 查询特定问题
  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(e => e).map(e => ' +' + e).join('')
    const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics')
    if (!question) {ctx.throw(404, '问题不存在')}
    ctx.body = question
  }

  // 新建问题
  async create (ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false },
      topics: { type: 'array', required: false }
    })
    ctx.body = await new Question({ ...ctx.request.body, questioner: ctx.state.user._id }).save()
  }

  // 修改问题
  async update (ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: false },
      description: { type: 'string', required: false },
      topics: { type: 'array', required: false }
    })
    await ctx.state.question.update(ctx.request.body)
    ctx.body = ctx.state.question
  }

  // 删除问题
  async del (ctx) {
    await Question.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }

  // 检测问题是否存在
  async checkQuestionExist (ctx, next) {
    const question = await Question.findById(ctx.params.id).select('+questioner')
    if (!question) {ctx.throw(404, '问题不存在')}
    ctx.state.question = question
    await next()
  }

  // 检测是否拥有问题
  async checkQuestioner (ctx, next) {
    const { question } = ctx.state
    if (question.questioner.toString() !== ctx.state.user._id) {ctx.throw(403, '无权限删除')}
    await next()
  }
}

module.exports = new QuestionsCtrl()
