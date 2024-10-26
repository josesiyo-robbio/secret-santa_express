

const express               =   require('express');
const router                =   express.Router();
const {GiftExchangeController} = require('../controller/gifExchangeController');


router.post('/new-exchange',GiftExchangeController.create_exchange);
router.post('/new-idea',GiftExchangeController.new_gift_idea);


module.exports = router;
