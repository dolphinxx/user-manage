const crypto = require('crypto');
const salt = '7$%6u89as,dh';
const encodePassword = (password) => {
    const hash = crypto.createHash('sha256');
    hash.update(password + salt);
    const digest = hash.digest();
    return digest.toString('hex');
}

const getRequestParams = (fields, params, skipEmpty) => {
    const result = {};
    if (!params) {
        return result;
    }
    for (let field of fields) {
        if (params[field] !== null && params[field] !== undefined) {
            if (skipEmpty && params[field] === '') {
                continue;
            }
            result[field] = params[field];
        }
    }
    return result;
}

module.exports = {
    encodePassword,
    getRequestParams,
}
