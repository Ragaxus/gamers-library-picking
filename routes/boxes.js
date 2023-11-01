const express = require('express');
const router = express.Router();
var env_path = (process.env.NODE_ENV == 'production') ? ".env" : "dev.env";
require('dotenv').config({path: env_path});

var Box = require('../config/models/box').connection.model('Box');

// Define the routes for CRUD operations
router.get('/', async (req, res) => {
  var allBoxes = await Box.find({}).lean();
  res.send(JSON.stringify(allBoxes));
});

router.post('/', async (req, res) => {
    await Box.create(req.body);
  var allBoxes = await Box.find({}).lean();
  res.send(JSON.stringify(allBoxes));
});

router.put('/:id', async (req, res) => {
  // Implement your code for updating a box by ID and responding with JSON
  await Box.findByIdAndUpdate(req.params.id, req.body);
  var allBoxes = await Box.find({}).lean();
  res.send(JSON.stringify(allBoxes));
});

router.delete('/:id', async (req, res) => {
  // Implement your code for deleting a box by ID and responding with JSON
  await Box.findByIdAndDelete(req.params.id);
  var allBoxes = await Box.find({}).lean();
  res.send(JSON.stringify(allBoxes));
});

// Export the router
module.exports = router;
