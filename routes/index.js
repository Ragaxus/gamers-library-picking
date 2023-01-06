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
var {
  connection
} = require('../config/models/order');
var Order = connection.model('Order');
var {
  connection
} = require('../config/models/card-metadata');
var CardMetadata = connection.model('CardMetadata');
var User = require('../config/models/user').connection.model('User');

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

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: ['https://www.googleapis.com/auth/userinfo.profile'],
  passReqToCallback: true,
}, function verify(req, issuer, profile, cb) {
  return cb(null, {
    name: profile.displayName
  }, {
    originalUrl: req.originalUrl
  });
}));

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, {
      id: user.id,
      username: user.username,
      name: user.name
    })
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

router.get('/oauth2/redirect/google', 
  passport.authenticate('google', { failureRedirect: '/login'}),
  function (req, res) {
    var state = req.authInfo.state;
    res.redirect(state.lastUrl || '/');
  }
  );

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  passport.authenticate('google', {state: {lastUrl: req.originalUrl}})(req, res, next);
}

router.get('/submit-order', isAuthenticated, function (req, res, next) {
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
        card.color = color_lookup[card_doc.color];
      } else {
        card.sets = []
        card.color = ""
      }
    });
    order.toPick = false;
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

let setDirectory = JSON.parse(fs.readFileSync('./utils/set_directory.json', {encoding: 'utf8'}));

let boxesData = JSON.parse(fs.readFileSync('./utils/boxes.json', {encoding:'utf8'}));

let boxInventory = new BoxInventory(setDirectory);
boxInventory.boxes = boxesData;


router.get('/card-locations', async function (req, res) {
  res.renderVue('pick-boxes', {
    cardsToPick: req.cards,
    boxIndex: {}
  });
});

router.post('/box-locations', async function (req, res) {
  let result = boxInventory.findCardsInBoxes(req.body.cards);
  res.send(result);
});

module.exports = router;