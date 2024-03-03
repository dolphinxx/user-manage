const express = require('express');
const {getRequestParams} = require("../utils");
const {selectUsers, countUsers, insertUser, selectUserById, updateUserById, deleteUserById} = require("../db");
const router = express.Router();

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
    const params = getRequestParams(['name', 'phone', 'idCard'], req.query);
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

module.exports = router;
