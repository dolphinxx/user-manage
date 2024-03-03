const {db} = require('../db');
const fs = require("fs");
const readline = require('node:readline/promises');
const path = require("path");
const {encodePassword} = require("../utils");

(async function () {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const answer = await rl.question('本操作将会永久清除所有保存的数据！如果确定请输入：setup\n');
    if (answer !== 'setup') {
        console.log('您已取消初始化.');
        process.exit(0);
        return;
    }
    console.log('开始初始化...')
    const scheme = fs.readFileSync(path.join(__dirname, "scheme.sql"), {
        encoding: "utf-8",
    });
    await new Promise((resolve, reject) => {
        db.exec(scheme, (err) => {
            if (err) {
                reject(new Error('执行初始化SQL失败', {cause: err}));
                return;
            }
            resolve();
        });
    })
    await new Promise((resolve, reject) => {
        db.run('INSERT INTO `admin`(name, username, password, createTime)VALUES(?, ?, ?, ?)', ['管理员', 'admin', encodePassword('123456'), new Date().getTime()], (err) => {
            if (err) {
                reject(new Error('插入管理员账号失败', {cause: err}));
                return;
            }
            resolve();
        });
    })
    console.log('初始化完成，管理员账号[admin], 初始密码[123456]');
    db.close(() => {
        process.exit(0);
    });
}());
