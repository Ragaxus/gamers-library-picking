const axios = require('axios');
const fs = require('fs');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var passport = require('passport');
var base64url = require('base64url');
var GoogleStrategy = require('passport-google-oidc');
var BoxInventory = require('../utils/box-inventory');

//Mongoose
var Order = require('../config/models/order').connection.model('Order');
var CardMetadata = require('../config/models/card-metadata').connection.model('CardMetadata');
var User = require('../config/models/user').connection.model('User');
var Box = require('../config/models/box').connection.model('Box');

async function getActiveOrders() {
  return await Order.find({}).where('status').nin(['sold', 'cancelled']).lean();
};

async function getAllCardNames() {
  let names = await CardMetadata.find({}).select('name').lean();
  return names.map(name => name.name);
}

async function addCardMetadataToOrders(orders) {
  var order_info = orders.map(async function (order) {
    order_card_names = order.cards.map(card => card.name);
    card_metadata_docs = await CardMetadata.find({
      'name': {
        $in: order_card_names
      }
    });
    card_metadata = card_metadata_docs.reduce(function (data, card_doc) {
      data[card_doc.name] = card_doc;
      return data;
    }, {});
    order.cards.forEach(async function (card) {
      card_doc = card_metadata[card.name];
      if (card_doc) {
        card.sets = card_doc.sets;
        card.color = card_doc.color;
      } else {
        card.sets = []
        card.color = ""
      }
    });
    order.toPick = false;
    if (!order.cards_found) {
      order.cards_found = [];
    }
    return order;
  });
  return await Promise.all(order_info);
}

router.get('/init', async function (req, res, next) {
  var orders = await getActiveOrders();
  var order_data = await addCardMetadataToOrders(orders);
  var card_names = await getAllCardNames();
  const data = {
    card_names,
    order_data
  }
  res.send(data);
});



router.get('/order', async function (req, res) {
  try {
    const search_params = req.query;
    var orders_to_send;
    if (search_params.showInactiveOrders === 'false') orders_to_send = await getActiveOrders();
    else orders_to_send = await Order.find({}).lean();
    res.send(await addCardMetadataToOrders(orders_to_send));
  } catch (error) {
    res.statusCode = 400;
    res.send({
      "error": error.stack
    })
  }
});

router.post('/order', async function (req, res) {
  var newOrder = req.body;
  Order.create(newOrder, async function (err, newOrderRecord) {
    if (err) res.renderVue('error.vue', {
      title: 'Error creating your order :('
    })
    var newOrderArr = await addCardMetadataToOrders([newOrderRecord.toObject()]); 
    var newCardObj = newOrderArr[0];
    return res.send(200, newCardObj);
  });
});

router.put('/order/:orderId', async function (req, res) {
  const order = await Order.findByIdAndUpdate(req.params.orderId, req.body);
  res.send('succeeded');
});

let setDirectory = JSON.parse(fs.readFileSync('./utils/set_directory.json', {
  encoding: 'utf8'
}));

//let boxesData = JSON.parse(fs.readFileSync('./utils/boxes.json', {encoding:'utf8'}));
let boxInventory = new BoxInventory(setDirectory);

router.post('/box-locations', async function (req, res) {
  boxInventory.boxes = await Box.find({}).lean();
  let result = boxInventory.findCardsInBoxes(req.body.cards);
  res.send(result);
});

module.exports = router;