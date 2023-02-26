const fs = require('fs');
const fuzzysort = require('fuzzysort');

var entered_name = "ghiti";
var cardnames = JSON.parse(fs.readFileSync("card_names_test.json")) 

var result = fuzzysort.go(entered_name, cardnames, { limit: 1})
    .map(r => r.target)[0];

console.log(result);