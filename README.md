# zhihu-api
node课程—仿知乎api

# To Do List
1. 关注/取消关注问题 功能 自行实现（参考用户粉丝功能）

# 目录注解
1. controller 控制器
2. middleware 中间件
3. models 数据库scheme
4. public 公共
5. routes 路由

# 代码说明
1. koaBody(formidable.uploadDir)把public文件夹作为服务器对外输出的公共路径，可直接访问该目录下得当前文件
2. config.js文件中不能直接带数据库敏感信息，应放到环境变量中获取。
