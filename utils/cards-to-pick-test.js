var cards = [
    {
        name: "Felidar Guardian",
        color: "W",
        sets: ["mb1", "aer"]
    }
]

var cards_combined = cards
    .map((card) => card.name)
    .filter((value, index, self) => {
        return self.indexOf(value) === index
    })
    .map((name) => {
        var instances = cards.filter(card => card.name === name);
        return instances.slice(1).reduce((acc, card) => {
            acc.quantity += card.quantity;
            return acc;
        }, instances[0])
    });

console.log(cards_combined);