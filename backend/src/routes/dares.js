const express = require('express');
const router = express.Router();
const dareController = require('../controllers/dareController');

const betController = require('../controllers/betController');
const payoutController = require('../controllers/payoutController');

router.get('/feed', dareController.getFeed);
router.post('/create', dareController.createDare);
router.post('/enter', betController.enterBet);
router.post('/:id/proof', payoutController.submitProof);
router.post('/:id/vote', payoutController.castVote);
router.post('/:id/payout', payoutController.processPayout);

module.exports = router;
