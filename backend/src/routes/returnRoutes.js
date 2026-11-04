const express = require('express');
const returnController = require('../controllers/returnController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/request', (req, res, next) => returnController.requestReturn(req, res, next));
router.get('/my-returns', (req, res, next) => returnController.getMyReturns(req, res, next));
router.get('/lessor-returns', (req, res, next) => returnController.getLessorReturns(req, res, next));
router.get('/:id', (req, res, next) => returnController.getReturnById(req, res, next));
router.put('/:id/inspect', (req, res, next) => returnController.inspectReturn(req, res, next));
router.post('/:id/settle', (req, res, next) => returnController.settleDeposit(req, res, next));

module.exports = router;
