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
        var result = {}
        cards.forEach((card, cardIdx) => {
            card.sets.forEach(set => {
                var set_type = this.getSetType(set);
                if (!set_type) return;

                var card_info = {
                    name: card.name,
                    color: card.color,
                    set: set
                }

                this.boxes.filter(box => box.type == set_type).forEach(box => {
                    if (this.boxHasCard(box, card_info)) {
                        var name = box.name;
                        if (name in result) result[name].push(cardIdx);
                        else result[name] = [cardIdx];
                    }
                })
            });
        });
        return result;
    }
}

module.exports = BoxInventory;