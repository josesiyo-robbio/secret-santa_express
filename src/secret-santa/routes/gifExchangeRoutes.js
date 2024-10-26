

const express               =   require('express');
const router                =   express.Router();
const {GifExchangeController} = require('../controller/gifExchangeController');


router.post('/new-exchange',GifExchangeController.create_exchange);



module.exports = router;
