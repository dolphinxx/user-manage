const uuid = require('uuid');
const NodeCache = require('node-cache');
const sessions = new NodeCache();

// in ms
const SESSION_EXPIRES = 2 * 3600000;
const REMEMBERED_SESSION_EXPIRES = 7 * 24 * 3600000;

function auth(req, res, next) {
    if (!req.cookies) {
        res.json({status: 401, message: '请登录'});
        return;
    }
    const token = req.cookies['token'];
    const session = sessions.get(token);
    if (!session) {
        res.json({status: 401, message: '请登录'});
        return;
    }
    req.principal = session;
    next();
}

function createSession(principal, ttl) {
    const token = uuid.v4();
    sessions.set(token, principal, ttl);
    return token;
}

function invalidSession(token) {
    sessions.del(token);
}

module.exports = {
    auth,
    createSession,
    invalidSession,
    SESSION_EXPIRES,
    REMEMBERED_SESSION_EXPIRES,
};
