const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("overdue.db");

const selectAdminByUsername = async (username) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM admin WHERE username = ?`, [username], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

const updateAdminPassword = async (id, password) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE admin SET password = ? WHERE id = ?', [password, id], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    })
}

const userColumns = ['id', 'name', 'phone', 'idCard', 'status', 'remark', 'createTime', 'updateTime']

const buildQueryConditions = (params, columns) => {
    const placeholderParams = [];
    const sql = Object.entries(params).filter(_ => columns.includes(_[0])).map(_ => {
        placeholderParams.push(_[1]);
        return `\`${_[0]}\` = ?`;
    }).join(' AND ');
    return [sql, placeholderParams];
}

const buildInsertParams = (params, columns) => {
    const placeholderParams = [];
    const fields = Object.entries(params).filter(_ => columns.includes(_[0])).map(_ => {
        placeholderParams.push(_[1]);
        return _[0];
    });
    fields.push('createTime');
    placeholderParams.push(new Date().getTime());
    return [fields.join(', '), fields.map(() => '?').join(', '), placeholderParams];
}

const buildUpdateParams = (params, columns) => {
    const placeholderParams = [];
    const entries = Object.entries(params).filter(_ => columns.includes(_[0]) && _[0] !== 'id');
    entries.push(['updateTime', new Date().getTime()]);
    const sql = entries.map(_ => {
        placeholderParams.push(_[1]);
        return `\`${_[0]}\` = ?`;
    }).join(', ');
    return [sql, placeholderParams];
}

const selectUsers = async (params, offset, limit) => {
    const [conditionSql, conditionParams] = buildQueryConditions(params, userColumns);
    let sql = `SELECT * FROM \`user\``;
    if (conditionParams.length > 0) {
        sql += ' WHERE ' + conditionSql;
    }
    sql += ` LIMIT ${offset || 0}, ${limit || 10}`;
    return new Promise((resolve, reject) => {
        db.all(sql, conditionParams, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows)
        })
    })
};

const countUsers = async (params) => {
    const [conditionSql, conditionParams] = buildQueryConditions(params, userColumns);
    let sql = `SELECT COUNT(0) AS total FROM \`user\``;
    if (conditionParams.length > 0) {
        sql += ' WHERE ' + conditionSql;
    }
    return new Promise((resolve, reject) => {
        db.get(sql, conditionParams, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row.total);
        })
    })
};

const selectUserById = async (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM user WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

const insertUser = async (params) => {
    const [columnsSql, placeholderSql, placeholderParams] = buildInsertParams(params, userColumns);
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO user(${columnsSql})VALUES(${placeholderSql})`, placeholderParams, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
}

const updateUserById = async (id, params) => {
    const [updateSql, placeholderParams] = buildUpdateParams(params, userColumns);
    placeholderParams.push(id);
    return new Promise((resolve, reject) => {
        db.run(`UPDATE user SET ${updateSql} WHERE id = ?`, placeholderParams, function (err) {
            if (err) {
                reject(err);
                return;
            }
            if (this.changes === 0) {
                reject('更新失败');
                return;
            }
            resolve();
        });
    });
}

const deleteUserById = async (id) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM user WHERE id = ?`, [id], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        })
    })
}

module.exports = {
    db,
    selectAdminByUsername,
    updateAdminPassword,
    selectUsers,
    countUsers,
    selectUserById,
    insertUser,
    updateUserById,
    deleteUserById,
}
