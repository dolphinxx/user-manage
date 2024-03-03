const express = require('express');
const router = express.Router();
const {selectAdminByUsername, updateAdminPassword} = require('../db');
const {encodePassword} = require('../utils');
const {createSession, invalidSession, SESSION_EXPIRES, REMEMBERED_SESSION_EXPIRES, auth} = require('../auth');

// router.get('/login', (req, res) => {
//     res.render('login');
// });

router.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const rememberMe = req.body.rememberMe;
    if (!username || !password) {
        res.json({status: 401, message: '账号或密码错误'});
        return;
    }
    const account = await selectAdminByUsername(username);
    if (!account || account.password !== encodePassword(password)) {
        res.json({status: 401, message: '账号或密码错误'});
        return;
    }
    const principal = {id: account.id, name: account.name, username: account.username};
    const ttl = rememberMe === 'true' ? REMEMBERED_SESSION_EXPIRES : SESSION_EXPIRES;
    const token = createSession(principal, Math.trunc(ttl/1000));
    const expires = new Date(new Date().getTime() + ttl);
    res.cookie('token', token, {path: '/', expires});
    res.json({status: 200, data: principal});
});

router.get('/logout', auth, (req, res) => {
    const token = req.cookies['token'];
    invalidSession(token);
    res.cookie('token', '', {path: '/', expires: new Date()});
    res.json({status: 200});
});

router.post('/change_password', auth, async (req, res) => {
    const oldPassword = req.body.oldPassword;
    const password = req.body.password;
    if (!oldPassword || !password) {
        res.json({status: 400, message: '密码不能为空'});
        return;
    }
    const account = await selectAdminByUsername(req.principal.username);
    if (account.password !== encodePassword(oldPassword)) {
        res.json({status: 400, message: '旧密码错误'});
        return;
    }
    await updateAdminPassword(account.id, encodePassword(password));
    res.json({status: 200});
});

router.get('/principal', auth, (req, res) => {
    res.json({status: 200, data: req.principal});
});

module.exports = router;
