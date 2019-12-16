const Koa = require('koa')
const koaBody = require('koa-body') // 解析body参数
const koaStatic = require('koa-static') // 生成图片url
const error = require('koa-json-error') //错误处理
const parameter = require('koa-parameter') // 参数校验
const mongoose = require('mongoose') //mongodb驱动
const path = require('path')
const app = new Koa()
const routes = require('./routes')
const { connectionStr } = require('./config')

mongoose.connect(connectionStr, { useNewUrlParser: true }, () => console.log('MongoDB连接成功'))
mongoose.connection.on('error', console.error)

// 处理图片url中间件
app.use(koaStatic(path.join(__dirname, 'public')))

// 注册错误处理中间件
app.use(error({
  postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))

// 注册body解析中间件
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads'),
    keepExtensions: true
  }
}))

// 参数校验（校验请求体）注册在body解析中间件后面
app.use(parameter(app))

// 批量注册路由中间件
routes(app)

app.listen(3000, () => {})
