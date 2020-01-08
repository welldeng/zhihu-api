const Answer = require('../models/answers')

// const User = require('../models/users')

class AnswersCtrl {
  // 查询答案列表
  async find (ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page, 1)
    const q = new RegExp(ctx.query.q)
    ctx.body = await Answer.find({ content: q, questionId: ctx.params.questionId })
      .limit(perPage)
      .skip(page * perPage)
  }

  // 查询特定答案
  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(e => e).map(e => ' +' + e).join('')
    const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer')
    if (!answer) {ctx.throw(404, '答案不存在')}
    ctx.body = answer
  }

  // 新建答案
  async create (ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true }
    })
    const answerer = ctx.state.user._id
    const { questionId } = ctx.params
    ctx.body = await new Answer({
      ...ctx.request.body,
      answerer,
      questionId
    }).save()
  }

  // 修改答案
  async update (ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: false }
    })
    await ctx.state.answer.update(ctx.request.body)
    ctx.body = ctx.state.answer
  }

  // 删除答案
  async del (ctx) {
    await Answer.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }

  // 检测答案是否存在
  async checkAnswerExist (ctx, next) {
    const answer = await Answer.findById(ctx.params.id).select('+answerer')
    if (!answer) {ctx.throw(404, '答案不存在')}
    // 只有删改查答案的时候才检查此逻辑，赞、踩答案不检查
    if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) {ctx.throw(404, '该问题下没有此答案')}
    ctx.state.answer = answer
    await next()
  }

  // 检测是否拥有答案
  async checkAnswerer (ctx, next) {
    const { answer } = ctx.state
    if (answer.answerer.toString() !== ctx.state.user._id) {ctx.throw(403, '无权限')}
    await next()
  }
}

module.exports = new AnswersCtrl()
