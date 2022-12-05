const {
    pick
} = require('stream-json/filters/Pick');
const {
    streamArray
} = require('stream-json/streamers/StreamArray');
const {
    chain
} = require('stream-chain');
const {
    parser
} = require('stream-json/parser');
const fs = require('fs');
const axios = require('axios');

//Mongoose
var {
    connection
} = require('../config/models/card-metadata');
var CardMetadata = connection.model('CardMetadata');

async function getAllCardsUrl() {
    //get url to call to retrieve all cards
    var response = await axios.get('https://api.scryfall.com/bulk-data');
    var allCardsUrl = response.data
        .data
        .find((entry) => entry.type == 'all_cards')
        .download_uri;
    return allCardsUrl;
}

async function allCardsStreamFromScryfall() {
    try {
        var allCardsUrl = getAllCardsUrl();
        //actually retrieve all the cards
        return await axios.get(allCardsUrl, {
            responseType: "stream"
        });
    } catch (error) {
        console.log(error);
    }
}

function allCardsStreamFromFile(input_file_path) {
    var stream = fs.createReadStream(input_file_path);
    return stream;
}

function determineColor(card_info) {
    try {
        const colors = ['W', 'U', 'B', 'R', 'G']
        if ('type_line' in card_info) {
            const type_line = card_info.type_line.split('//')[0];
            if (type_line.includes("Land")) {
                return "L";
            }
        }
        var mana_cost;
        if ('mana_cost' in card_info) {
            mana_cost = card_info.mana_cost.split('//')[0];
        } else {
            mana_cost = card_info.card_faces[0].mana_cost.split('//')[0];
        }
        const card_colors = colors.filter(c => mana_cost.includes(c))
        if (card_colors.length > 1) {
            return "M";
        } else if (card_colors.length == 0) {
            return "C";
        } else {
            return card_colors[0];
        }
    } catch (err) {
        console.log(card_info)
        throw err
    }
}

async function processAllCards(allCards_stream) {
    var cardData = {}

    const pipeline = chain([
        allCards_stream,
        parser(),
        streamArray()
    ]);

    pipeline.on('data', data => {
        const card_info = data.value;
        if (!card_info.games.includes("paper")) {
            return;
        }
        const name = card_info.name;
        if (!(name in cardData)) {
            cardData[name] = {
                color: determineColor(card_info),
                sets: [card_info.set]
            }
        } else {
            cardData[name].sets.push(card_info.set)
        }
    });
    pipeline.on('end', async () => {
        newCardData = Object.entries(cardData)
            .map(([name, metadata]) => {
                metadata.name = name;
                metadata.sets = [...new Set(metadata.sets)];
                return metadata
            });
        await CardMetadata.deleteMany({});
        await CardMetadata.insertMany(newCardData, function (err) {
            connection.close()
        });
    });
}

(async () => {
    var allCards_stream = allCardsStreamFromFile("C:\\Users\\ragax\\Downloads\\all-cards-20221202221942.json");
    var new_card_data = await processAllCards(allCards_stream);
})();

//(async () => {
//    var response = await axios('https://api.scryfall.com/cards/search?q=Silundi%20Visions&pretty=true')
//    console.log(determineColor(response.data.data[0]))
//})();