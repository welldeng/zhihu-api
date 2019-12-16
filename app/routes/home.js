const Router = require('koa-router') // 路由
const router = new Router()
const { index, upload } = require('../controllers/home')

router.get('/', index)

router.post('/upload', upload)

module.exports = router
