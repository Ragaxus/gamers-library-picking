// Given a list of cards with set info and a list of boxes,
// Returns a dictionary of box names where each box name has as a value
// an array of the names of the cards that will appear in that box.


function numAsThreeLetters(num) {
    let digits = []
    while (num > 0) {
      let digit = num % 26
      digits.unshift(digit)
      num -= digit
      num /= 26
    }
    var letters = String.fromCharCode(...digits.map(d => d + 97));
    return letters.padStart(3, 'a');
}

class SortableCard {
    static colorOrder = ["W", "U", "B", "R", "G", "C", "L", "M"];
    constructor(card_data, set_order) {
        this.color = card_data.color;
        this.set = card_data.set;
        this.name = card_data.name;
        this.set_order = set_order;
    }
}

SortableCard.prototype.valueOf = function() {
    return ''.concat(
        numAsThreeLetters(this.set_order.indexOf(this.set)),
        numAsThreeLetters(SortableCard.colorOrder.indexOf(this.color)),
        this.name
    );
}


class BoxInventory {
    constructor(setdirectory) {
        this.setDirectory = setdirectory;
    }
    set boxes(aBoxes) {
        this._boxes = aBoxes;
    }
    get boxes() {
        return this._boxes;
    }

    getSetType(set) {
        for (var set_type of Object.keys(this.setDirectory)) {
            if (this.setDirectory[set_type].includes(set)) {
                return set_type;
            }
        }
        return null;
    }

    boxHasCard(box, card_info) {
        if ('sets' in box && box.sets.includes(card_info.set)) {
            return true;
        }
        else if ('startCard' in box && 'endCard' in box) {
            let set_order = this.setDirectory[box.type]
            let cardToFind = new SortableCard(card_info, set_order);
            return (cardToFind >= new SortableCard(box.startCard, set_order) 
            && cardToFind <= new SortableCard(box.endCard, set_order));
        }
    }


    findCardsInBoxes(cards) {
        var result = []
        if (!cards) return result;
        var boxIndex = {};
        cards.forEach((card) => this.processCard(card, boxIndex));

        Object.entries(boxIndex).forEach(boxEntry => {
            let box_name = boxEntry[0];
            let box_info = boxEntry[1];
            let cards_in_box = box_info.cards;
            var set_and_color_index = {}; 
            set_and_color_index = cards_in_box.reduce((acc, card) => {
                if (!(card.set in acc)) {
                    acc[card.set] = {};
                }
                if (!(card.color in acc[card.set])) {
                    acc[card.set][card.color] = [];
                }
                acc[card.set][card.color].push({name: card.name, quantity: card.quantity});
                return acc;
            }, {});
            let set_order = Object.entries(this.setDirectory)
            .map(e => {return e[1]})
            .flat();
            let cards_by_set = Object.entries(set_and_color_index)
            .map(sc_entry => {
                let cards_by_color = Object.entries(sc_entry[1])
                .map(c_entry => {
                    cards = c_entry[1].sort((ca, cb) => ca.name.localeCompare(cb.name));
                    return {color: c_entry[0], cards} })
                .sort((ca, cb) => {
                    let order = SortableCard.colorOrder;
                    return order.indexOf(ca.color) - order.indexOf(cb.color);
                });
                return {set: sc_entry[0], cards_by_color};
            })
            .sort((sca, scb) => { return set_order.indexOf(sca.set) - set_order.indexOf(scb.set) } );
            let type = box_info.type;
            let releaseDate = box_info.releaseDate;
            result.push({box_name, type, releaseDate, cards_by_set});
        })
        return result;

        
    }

    processCard(card, boxIndex) {
            const basicsBox = {name: "Basics", type: "basics", releaseDate: new Date(2099, 11, 31)};
            if (["Plains", "Island", "Swamp", "Mountain", "Forest"].includes(card.name)) {
                this.addToBoxIndex(boxIndex, basicsBox, card);
                return;
            }
            card.sets.forEach(set => {
                var set_type = this.getSetType(set);
                if (!set_type) return;

                var card_info = JSON.parse(JSON.stringify(card));
                card_info.set = set;

                this.boxes.filter(box => box.type == set_type).forEach(box => {
                    if (this.boxHasCard(box, card_info)) {
                        var name = box.name;
                        this.addToBoxIndex(boxIndex, box, card_info)
                    }
                })
            });
        }

    addToBoxIndex(boxIndex, box, card_info) {
            var name = box.name;
            if (!(name in boxIndex)) { boxIndex[name] = { cards: [], type: box.type, releaseDate: box.releaseDate }} 
            boxIndex[name].cards.push(card_info)
        }
}

module.exports = BoxInventory;