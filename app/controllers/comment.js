const Comment = require('../models/comment')

// const User = require('../models/users')

class CommentsCtrl {
  // 查询评论列表
  async find (ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page, 1)
    const q = new RegExp(ctx.query.q)
    const { questionId, answerId } = ctx.params
    ctx.body = await Comment.find({ content: q, questionId, answerId })
      .limit(perPage)
      .skip(page * perPage)
      .populate('commentator')
  }

  // 查询特定评论
  async findById (ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(e => e).map(e => ' +' + e).join('')
    const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator')
    if (!comment) {ctx.throw(404, '评论不存在')}
    ctx.body = comment
  }

  // 新建评论
  async create (ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true }
    })
    const commentator = ctx.state.user._id
    const { questionId, answerId } = ctx.params
    ctx.body = await new Comment({
      ...ctx.request.body,
      commentator,
      answerId,
      questionId
    }).save()
  }

  // 修改评论
  async update (ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: false }
    })
    await ctx.state.comment.update(ctx.request.body)
    ctx.body = ctx.state.comment
  }

  // 删除评论
  async del (ctx) {
    await Comment.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }

  // 检测评论是否存在
  async checkCommentExist (ctx, next) {
    const comment = await Comment.findById(ctx.params.id).select('+commentator')
    if (!comment) {ctx.throw(404, '评论不存在')}
    // 只有删改查答案的时候才检查此逻辑，赞、踩答案不检查
    if (ctx.params.questionId && comment.questionId !== ctx.params.questionId) {ctx.throw(404, '该问题下没有此评论')}
    if (ctx.params.answerId && comment.answerId !== ctx.params.answerId) {ctx.throw(404, '该答案下没有此评论')}
    ctx.state.comment = comment
    await next()
  }

  // 检测是否拥有评论
  async checkCommentator (ctx, next) {
    const { comment } = ctx.state
    if (comment.commentator.toString() !== ctx.state.user._id) {ctx.throw(403, '无权限')}
    await next()
  }
}

module.exports = new CommentsCtrl()
