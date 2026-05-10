const express = require('express');
const router = express.Router();
const shadowController = require('../controllers/shadowController');

router.post('/generate', shadowController.generateShadow);
router.post('/chat', shadowController.chat);
router.get('/status/:userId', shadowController.getShadowStatus);

module.exports = router;
