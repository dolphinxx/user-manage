# 逾期管理

简易的逾期人员管理，只包含账号登录和逾期人员的增、删、改、查等功能。

后台使用Express实现，数据库使用sqlite3。

前端见frontend目录

## 部署

将以下文件和目录复制到服务器

- bin/
- public/
- routes/
- setup/
- app.js
- auth.js
- db.js
- package.json
- utils.js

执行以下命令
```bash
# 安装依赖
npm install
# 初始化数据库
npm run setup
# 启动服务
npm run start
```

默认侦听端口为3000，可通过`process.env.PORT`或者在`.env`文件中添加`PORT=8080`来指定其它值。

nohup启动
```
nohup npm run start >> overdue.log 2>&1 &
nohup yarn start >> overdue.log 2>&1 &
```
