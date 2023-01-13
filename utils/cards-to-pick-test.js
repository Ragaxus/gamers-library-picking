var cards = [{
        "name": "Shock",
        "quantity": 1,
        "color": "red",
        "sets": ["9ED", "ASDF"]
    },
    {
        "name": "Shock",
        "quantity": 3,
        "color": "red",
        "sets": ["9ED", "ASDF"]
    },
    {
        "name": "Time Walk",
        "quantity": 2,
        "color": "blue",
        "sets": ["9ED", "ASDF"]
    }
];

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