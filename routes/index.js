const axios = require('axios');
const fs = require('fs');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var passport = require('passport');
var base64url = require('base64url');


var env_path = (process.env.NODE_ENV == 'production') ? ".env" : "dev.env";
require('dotenv').config({ path: env_path });

//Mongoose
var Order = require('../config/models/order').connection.model('Order');
var CardMetadata = require('../config/models/card-metadata').connection.model('CardMetadata');
var User = require('../config/models/user').connection.model('User');
var Box = require('../config/models/box').connection.model('Box');
var SetDirectory = require('../config/models/set-directory').connection.model('SetDirectory');
var BoxInventory = require('../utils/box-inventory');

async function getActiveOrders() {
  return await Order.find({
    $or: [
      { status: "placed" },
      {
        $and: [
          { status: { $nin: ["sold", "cancelled"] } },
          { created_date: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) } }
        ]
      }
    ]
  }).lean();
};

async function getAllCardNames() {
  let name_info = await CardMetadata.aggregate([
    {
      '$group': {
        '_id': null,
        'combinedNames': {
          '$addToSet': '$name'
        },
        'combinedRealNames': {
          '$addToSet': '$realName'
        }
      }
    }, {
      '$project': {
        '_id': 0,
        'names': {
          '$concatArrays': [
            '$combinedNames', '$combinedRealNames'
          ]
        }
      }
    }
  ]);
  return name_info[0].names;
}

async function addCardMetadataToOrders(orders) {
  var order_info = orders.map(async function (order) {
    if (order.status !== "placed") return order;
    order_card_names = order.cards.map(card => card.name);
    card_metadata_docs = await CardMetadata.find({
      $or: [
        {
          'name': {
            $in: order_card_names
          }
        },
        {
          'realName': {
            $in: order_card_names
          }
        }
      ]
    }).lean();
    card_metadata = card_metadata_docs.reduce(function (data, card_doc) {
      data[card_doc.name] = card_doc;
      return data;
    }, {});
    order.cards.forEach(async function (card) {
      card_doc = card_metadata[card.name];
      if (card_doc) {
        Object.assign(card, card_doc);
        const flavorVersion = card_metadata_docs.find(obj => obj.realName === card.name);
        card = { ...(flavorVersion ? { synonym: flavorVersion } : {}), ...card };

      } else {
        card.sets = []
        card.color = ""
      }
    });
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
  const data = {
    order_data
  }
  res.send(data);
});

router.get('/cardNames', async function (req, res, next) {
  res.send(await getAllCardNames());
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
    if (err) return res.status(400).send(err);
    var newOrderArr = await addCardMetadataToOrders([newOrderRecord.toObject()]);
    var newCardObj = newOrderArr[0];
    return res.status(200).send(newCardObj);
  });
});

router.put('/order/:orderId', async function (req, res) {
  await Order.findByIdAndUpdate(req.params.orderId, req.body, {
    new: true
  });
  return res.status(200).send();
});


router.post('/box-locations', async function (req, res) {
  let setDirectory = await SetDirectory.findOne({}, '-_id').lean();
  let boxInventory = new BoxInventory(setDirectory);
  boxInventory.boxes = await Box.find({}).lean();
  let result = boxInventory.findCardsInBoxes(req.body.cards);
  res.send(result);
});

router.get('/card', async function (req, res) {
  var cardName = req.query.name;
  let card = await CardMetadata.findOne({
    $or: [
      { name: { $regex: new RegExp(cardName, 'i') } }, // Case-insensitive match
      { name: { $regex: new RegExp(`${cardName} // .*`, 'i') } }
    ]
  }).lean();
  if (!card) res.status(500).send("Card not found");
  res.send(card);
});

router.get('/setDirectory', async function (req, res) {
  let setD = await SetDirectory.findOne({});
  res.send(setD);  
});

router.post('/setDirectory', async function (req, res) {
  await SetDirectory.findOneAndReplace({}, req.body);
  res.status(200).send();
})

module.exports = router;