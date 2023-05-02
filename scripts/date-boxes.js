// Require mongoose and axios modules
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({path: "../prod.env"});
var boxConnection = require('../config/models/box').connection;
var Box = boxConnection.model('Box');

// Fetch all the documents from the Boxes collection
var addDatesToBoxes = async function() {
Box.find({}, '-_id').lean()
  .then((boxes) => {
    console.log('Fetched', boxes.length, 'boxes from the database');

    // Fetch the data from the scryfall endpoint
    return axios.get('https://api.scryfall.com/sets')
      .then(async (response) => {
        // Extract the data array from the response
        const sets = response.data.data;

        // Create a map of set codes to release dates
        const setMap = {};
        for (let set of sets) {
          setMap[set.code] = new Date(set.released_at);
        }

        // Loop through each box and update its release date
        for (let box of boxes) {
          // If the box has a start card, look up its set and release date
          if (box.startCard) {
            let startSet = box.startCard.set; // Assume the set code is in the set property of the start card object
            let releaseDate = setMap[startSet];
            if (releaseDate) {
              box.releaseDate = releaseDate;
            } else {
              console.error('No release date found for set', startSet);
            }
          } else {
            // Otherwise, look up the release dates of all the sets in the box and take the oldest one
            let minDate = Infinity;
            for (let set of box.sets) {
              let releaseDate = setMap[set];
              if (releaseDate) {
                if (releaseDate < minDate) {
                  minDate = releaseDate;
                }
              } else {
                console.error('No release date found for set', set);
              }
            }
            if (minDate !== Infinity) {
              box.releaseDate = minDate;
            } else {
              console.error('No release date found for any set in the box', box.name);
            }
          }
        }

        // Save the boxes back to the database
        boxes.forEach(async function (box) {
            var oldOne  = await Box.findOneAndUpdate({name: box.name}, box, {upsert: true});
        });
      })
      .then(() => {
        console.log('Saved', boxes.length, 'boxes back to the database');
      })
      .catch((err) => {
        console.error('Error fetching data from scryfall', err);
      });
  })
  .catch((err) => {
    console.error('Error fetching boxes from the database', err);
  });
};

if (require.main === module) {
    (async () => {
        await addDatesToBoxes();
        // boxConnection.close();
    })();
}