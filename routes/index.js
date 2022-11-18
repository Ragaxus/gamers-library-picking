var format = require('date-format');

var express = require('express');
var router = express.Router();

//Mongoose
var {connection} = require('../config/models/order');
var Order = connection.model('Order');

router.get('/submit', function(req, res, next) {
  res.render('submit-order', {title: 'Submit Order'})
});

router.post('/submit-order', function(req, res){
    var newOrder = req.body;
    var cards = newOrder.cards;
    newOrder.cards = cards.split('\r\n');
    Order.create(newOrder, function(err, todo){
        if(err) res.render('error', { title: 'Error creating your order :('})
        res.redirect('/submit');
    });
});

router.get('/view-orders', async function(req, res){
  var oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  oneMonthAgo.setHours(0,0,0,0);
  var orders = await Order.find({}).where('updated_at').gt(oneMonthAgo).lean();
  orders = orders.map(order => { order.updated_at = format.asString('MM/dd/yyyy', order.updated_at); return order; });
  res.render('view-orders', {title: 'View Orders', orders: orders});
});


module.exports = router;
