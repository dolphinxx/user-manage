const express = require('express');
const {getRequestParams} = require("../utils");
const {
    selectUsers,
    countUsers,
    insertUser,
    selectUserById,
    updateUserById,
    deleteUserById,
    insertUsers
} = require("../db");
const router = express.Router();
const readXlsxFile = require('read-excel-file/node');
const writeXlsxFile = require('write-excel-file/node');

router.get('/detail', async (req, res) => {
    const id = req.query.id;
    if (!id) {
        res.json({
            status: 400,
            message: 'ID不能为空'
        });
        return;
    }
    const item = await selectUserById(id);
    res.json({
        status: 200,
        data: item,
    });
})

router.get('/paginate', async (req, res, next) => {
    const params = getRequestParams(['name', 'phone', 'idCard'], req.query, true);
    const pageNo = parseInt(req.query.pageNo || '1');
    const pageSize = parseInt(req.query.pageSize || '10');
    const offset = (pageNo - 1) * pageSize;
    const count = await countUsers(params);
    const items = count === 0 ? [] : await selectUsers(params, offset, pageSize);
    res.json({
        status: 200,
        data: {items, page: pageNo, size: pageSize, totalCount: count, totalPages: Math.ceil(count / pageSize)}
    });
});

router.post('/create', async (req, res) => {
    const params = getRequestParams(['name', 'phone', 'idCard', 'remark'], req.body);
    const id = await insertUser(params);
    if (id) {
        const item = await selectUserById(id);
        res.json({
            status: 200,
            data: item,
        });
        return;
    }
    res.json({
        status: 500,
        message: '操作失败',
    });
});
router.post('/update', async (req, res) => {
    const params = getRequestParams(['name', 'phone', 'idCard', 'remark'], req.body)
    const id = req.body.id;
    if (!id) {
        res.json({
            status: 400,
            message: 'ID不能为空'
        });
        return;
    }
    await updateUserById(id, params);
    const item = await selectUserById(id);
    res.json({
        status: 200,
        data: item,
    })
});
router.post('/delete', async (req, res) => {
    const id = req.body.id;
    if (!id) {
        res.json({
            status: 400,
            message: 'ID不能为空'
        });
        return;
    }
    await deleteUserById(id);
    res.json({
        status: 200,
    });
});

router.post('/import', async (req, res) => {
    if (!req.files) {
        res.json({
            status: 400,
            message: '缺少文件'
        });
        return;
    }
    const file = req.files[Object.keys(req.files)[0]];
    readXlsxFile(file.data).then(rows => {
        const data = [...rows].slice(1).map(_ => {
            // trim values
            for (let i = 0; i < 3; i++) {
                _[i] = String(_[i] || '').trim();
            }
            return _.slice(0, 3);
        })
            .filter(_ => _[0].length > 0);// name is required
        if (data.length === 0) {
            res.json({status: 400, message: '没有读取到有效数据'});
            return;
        }
        insertUsers(data).then((count) => {
            res.json({status: 200, data: count});
        }).catch(err => {
            res.json({
                status: 500,
                message: String(err),
            });
        });
    }).catch(err => {
        res.json({
            status: 500,
            message: '数据读取失败, ' + err,
        });
    });
});

router.get('/export', async (req, res) => {
    try {
        const schema = [
            {
                type: String,
                column: '真实姓名',
                value: row => row.name,
            },
            {
                type: String,
                column: '身份证号',
                value: row => row.idCard,
            },
            {
                type: String,
                column: '手机(末5位或全号)',
                value: row => row.phone,
            },
        ];
        const users = await selectUsers();
        const buffer = await writeXlsxFile(users, {schema});
        res.attachment('会员信息.xlsx');
        buffer.pipe(res);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

module.exports = router;
