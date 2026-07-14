const express=require('express')
const orderController =require('../controllers/order.controller')
const router=express.Router()

router.post('/webhook',express.raw({type:'application/json'}),orderController.stripeWebhook)
module.exports=router