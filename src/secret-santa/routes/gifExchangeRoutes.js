

const express               =   require('express');
const router                =   express.Router();
const {GiftExchangeController} = require('../controller/gifExchangeController');


router.post('/new-exchange',GiftExchangeController.create_exchange);
router.post('/new-idea',GiftExchangeController.new_gift_idea);
router.post('/aprove-idea',GiftExchangeController.aprove_idea);
router.post('/return-gift',GiftExchangeController.return_gift_sad);

module.exports = router;
