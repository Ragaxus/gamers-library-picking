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
require('dotenv').config({path: "../dev.env"});
var {
    connection
} = require('../config/models/card-metadata');
var CardMetadata = connection.model('CardMetadata');

class CompileSetInfo {
    constructor() {}
    async getAllCardsUrl() {
        //get url to call to retrieve all cards
        try {
            var response = await axios('https://api.scryfall.com/bulk-data');
            var allCardsUrl = response.data
                .data
                .find((entry) => entry.type == 'default_cards')
                .download_uri;
            return allCardsUrl;
        } catch (error) {
            console.log(error.message);
        }
    }

    async allCardsStreamFromScryfall() {
        try {
            var allCardsUrl = await this.getAllCardsUrl();
            //actually retrieve all the cards
            var allCardsResp = await axios.get(allCardsUrl, {
                responseType: "stream"
            });
            return allCardsResp.data;
        } catch (error) {
            console.log(error);
        }
    }

    allCardsStreamFromFile(input_file_path) {
        var stream = fs.createReadStream(input_file_path);
        return stream;
    }

    determineColor(card_info) {
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

    get_card_price(card_info) {
        let price = card_info.prices.usd;
        if (!price) price = card_info.prices.usd_foil;
        return price;
    }

    async processAllCards(allCards_stream) {
        var cardData = {}

        const pipeline = chain([
            allCards_stream,
            parser(),
            streamArray()
        ]);

        pipeline.on('data', data => {
            const card_info = data.value;

            if (!card_info.games.includes("paper")) return;
            if (card_info.layout == "token") return;

            var name = card_info.flavor_name;
            if (name == null) name = card_info.name;
            if (!(name in cardData)) {
                var priceDict = {};
                priceDict[card_info.set] = this.get_card_price(card_info);
                cardData[name] = {
                    color: this.determineColor(card_info),
                    sets: [card_info.set],
                    prices: priceDict
                }
                if (card_info.flavor_name != null) cardData[name].realName = card_info.name
            } else {
                cardData[name].sets.push(card_info.set);
                cardData[name].prices[card_info.set] = this.get_card_price(card_info);
            }
        });
        pipeline.on('end', async () => {
            var newCardData = Object.entries(cardData)
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
}

if (require.main === module) {
    (async () => {
        // var allCards_stream = allCardsStreamFromFile("C:\\Users\\ragax\\Downloads\\all-cards-20221202221942.json");
        var worker = new CompileSetInfo();
        var allCards_stream = await worker.allCardsStreamFromScryfall();
        var new_card_data = await worker.processAllCards(allCards_stream);
    })();
}

module.exports = CompileSetInfo;