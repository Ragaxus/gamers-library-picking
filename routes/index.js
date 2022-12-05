const axios = require('axios');
const fs = require('fs');
var express = require('express');
var router = express.Router();

//Mongoose
var {
  connection
} = require('../config/models/order');
var Order = connection.model('Order');
var {
  connection
} = require('../config/models/card-metadata');
var CardMetadata = connection.model('CardMetadata');


async function getActiveOrders() {
  return await Order.find({}).where('status').nin(['sold', 'cancelled']).lean();
};

//All current cards -- read from file which is updated out of band
var allCardNames;
fs.readFile('./default-cards.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const defaultCards = JSON.parse(data);
  allCardNames = defaultCards.map(card => card.name).sort();
});

router.get('/submit-order', function (req, res, next) {
  const data = {
    order: {
      customer_name: "",
      cards: [],
      comment: ""
    },
    new_item: {
      new_item_quantity: 0,
      new_item_name: ""
    },
    card_names: allCardNames
  };
  res.renderVue('submit-order', data);
});

const color_lookup = { 
                'L': "Land",
                'C': "Colorless",
                'M': "Multicolored",
                'W': "White",
                'U': "Blue",
                'B': "Black",
                'R': "Red",
                'G': "Green"
              }

async function addCardMetadataToOrders (orders) {
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
        card.color = color_lookup[card_doc.color];
      }
      else {
        card.sets = []
        card.color = ""
      }
    });
    return order;
  });
  return await Promise.all(order_info);
}

router.get('/view-orders', async function (req, res) {
  var orders = await getActiveOrders();
  var order_data = await addCardMetadataToOrders(orders);
  res.renderVue('view-orders', {
    orders: order_data,
    search_criteria: {
      showInactiveOrders: false
    }
  });
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

router.post('/order', function (req, res) {
  var newOrder = req.body;
  Order.create(newOrder, function (err, todo) {
    if (err) res.renderVue('error.vue', {
      title: 'Error creating your order :('
    })
  });
  res.send('succeeded');
});

router.put('/order/:orderId', async function (req, res) {
  const order = await Order.findByIdAndUpdate(req.params.orderId, req.body);
  res.send('succeeded');
});

module.exports = router;