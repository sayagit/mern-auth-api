const express = require('express');
const router = express.Router();


// import controller
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { read, update } = require('../controllers/user');
const { saveNewItem, readItems, updateItem } = require('../controllers/scheduleItem');

//localhost:8000/api/user/....
router.get('/user/:id', requireSignin, read);
router.put('/user/update', requireSignin, update);
router.put('/admin/update', requireSignin, adminMiddleware, update);
router.put('/scheduleItem/new', saveNewItem);
router.get('/scheduleItem/read', readItems);
router.put('/scheduleItem/update', updateItem);

module.exports = router;