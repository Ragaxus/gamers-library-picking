const BoxInventory = require("./box-inventory");
const fs = require('fs');


var cards = [
    {
        name: "Felidar Guardian",
        color: "W",
        sets: ["mb1", "aer"]
    },
    {
        name: "Forest",
        color: "L",
        sets: ["aer", "emn", "lots"]
    }
];

let setDirectory = JSON.parse(fs.readFileSync('./set_directory.json', {encoding: 'utf8'}));

// Read the file contents
fs.readFile('boxes.json', 'utf8', (error, data) => {
  if (error) {
    console.error(error);
    return;
  }

  // Parse the file contents as JSON
  let boxesData;
  try {
    boxesData = JSON.parse(data);
  } catch (error) {
    console.error(error);
    return;
  }

  let boxInventory = new BoxInventory(setDirectory);
  boxInventory.boxes = boxesData;
  let result = boxInventory.findCardsInBoxes(cards);
  console.log(JSON.stringify(result, null, 2));

});
