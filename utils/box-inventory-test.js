const BoxInventory = require("./box-inventory");
const fs = require('fs');

var setDirectory = {
    core: ["LEA", "LEB", "2ED", "3ED", "4ED", "5ED", "6ED", "7ED", "8ED", "9ED", "10E", "M10", "M11", "M12", "M13", "M14", "M15", "ORI", "M19", "M20", "M21"],
    standard: ["ARN","ATQ","LEG","DRK","FEM","ICE","HML","ALL","MIR","VIS","WTH","TMP","STH","EXO","USG","ULG","UDS","MMQ","NEM","PCY","INV","PLS","APC","ODY","TOR","JUD","ONS","LGN","SCG","MRD","DST","5DN","CHK","BOK","SOK","RAV","GPT","DIS","CSP","TSP","TSB","PLC","FUT","LRW","MOR","SHM","EVE","ALA","CON","ARB","ZEN","WWK","ROE","SOM","MBS","NPH","ISD","DKA","AVR","RTR","GTC","DGM","THS","BNG","JOU","KTK","FRF","DTK","BFZ","OGW","SOI","EMN","KLD","AER","AKH","HOU","XLN","RIX","DOM","GRN","RNA","WAR","ELD","THB","IKO","ZNR","KHM","STX","AFR","MID","VOW","NEO","SNC","DMU","BRO"],
    supplemental: ["MMA","MM2","EMA","MM3","IMA","A25","UMA","2XM","2X2","TSR","MH1","MH2","CMD","CM1","C13","C14","C15","C16","CMA","C17","CM2","C18","C19","C20","ZNC","CMR","KHC","C21","AFC","MIC","VOC","NEC","NCC","CLB","40K","BRC","CNS","CN2","BOT","BRR"]
};


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
  let result = boxInventory.findCardsInBoxes([
    {
        name: "Abzan Falconer",
        sets: ["2x2", "ktk"],
        color: "W"
    }
  ]);
  console.log(JSON.stringify(result));

});
