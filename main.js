Array.prototype.last = function () {
    return this[this.length - 1];
}

var SuitsEnum = Object.freeze({
    spade : {str : 'Spade'},
    heart : {str : 'Heart'},
    diamond : {str : 'Diamond'},
    club : {str : 'Club'}
});
var RanksEnum = Object.freeze({
    ra : {str : 'Ace'},
    r2 : {str : '2'},
    r3 : {str : '3'},
    r4 : {str : '4'},
    r5 : {str : '5'},
    r6 : {str : '6'},
    r7 : {str : '7'},
    r8 : {str : '8'},
    r9 : {str : '9'},
    r10 : {str : '10'},
    rj : {str : 'Jack'},
    rq : {str : 'Queen'},
    rk : {str : 'King'}
});

function Card(suit, rank) {
    this.suit = suit;
    this.rank = rank;
}

Card.prototype.takes = function (card) {
    if (card && card.hasOwnProperty('rank')) {
        return this.rank === RanksEnum.rk || this.rank === card.rank;
    }

    return false;
}

Card.prototype.str = function () {
    return this.rank.str + ' of ' + this.suit.str + 's';
}

Card.prototype.row = function () {
    var row = document.createElement('tr');

    var rankcell = document.createElement('td');
    rankcell.innerHTML = this.rank.str;

    var suitcell = document.createElement('td');
    suitcell.innerHTML = this.suit.str;

    row.appendChild(rankcell);
    row.appendChild(suitcell);

    return row;
}

function Deck() {
    var suit;
    var rank;

    this.cards = [];
    for (suit in SuitsEnum) {
        if (SuitsEnum.hasOwnProperty(suit)) {
            for (rank in RanksEnum) {
                if (RanksEnum.hasOwnProperty(rank)) {
                    this.cards.push(new Card(SuitsEnum[suit], RanksEnum[rank]));
                }
            }
        }
    }

    this.shuffle();
}

Deck.prototype.shuffle = function() {
    var currX = this.cards.length;
    var tCard;
    var randomX;

    while (0 !== currX) {
        randomX = Math.floor(Math.random() * currX);
        currX -= 1;

        tCard = this.cards[currX];
        this.cards[currX] = this.cards[randomX];
        this.cards[randomX] = tCard;
    }
};

Deck.prototype.halfSplit = function () {
    halfCount = Math.trunc(this.cards.length / 2);
    return [this.cards.slice(0, halfCount), this.cards.slice(halfCount)]
}

function textdraw(hands, p, active) {
    var headers = [document.getElementById('leftheader'), document.getElementById('rightheader')];

    var left = document.getElementById('left');
    var pile = document.getElementById('pile');
    var right = document.getElementById('right');

    function repr(cards) {
        var cardtable = document.createElement('tbody');

        for (var i = 0; i < cards.length; i++) {
            cardtable.appendChild(cards[i].row());
        }

        return cardtable;
    }

    function revrepr(cards) {
        var cardtable = document.createElement('tbody');

        for (var i = cards.length - 1; i >= 0; i--) {
            var card = cards[i];
            var row = card.row();
            
            if (card.rank == RanksEnum.rk) {
                row.style['color'] = '#E55';
            }

            cardtable.appendChild(row);
        }

        return cardtable;
    }

    headers[active].className = 'active';
    headers[1 - active].className = '';

    left.replaceChild(revrepr(hands[0]), left.firstChild);
    pile.replaceChild(repr(p), pile.firstChild);
    right.replaceChild(revrepr(hands[1]), right.firstChild);
}

function redraw(hands, p, active) {
    textdraw(hands, p, active);
}

function sliderstopToSpeedfactor(sliderstop) {
    // assertion: 1 <= sliderstop
    // python: [(n * (n - 1))/4 + 0.5 for n in range(1, 11)]

    if (1 <= sliderstop) {
        return (sliderstop * (sliderstop - 1)) / 4 + 0.5;
    }

    return 1;
}

function timeout(speedfactor) {
    var basetimeout = 1000;
    return basetimeout / speedfactor;
}

function papazgame() {
    var speedslider = document.getElementById('speedslider');

    var winner = null;
    var deck = new Deck();

    var hands = deck.halfSplit();
    var active = 0;
    var passive;

    var pile = [];

    redraw(hands, pile, active);

    var timeoutData = null;

    speedslider.oninput = function (event) {
        if (timeoutData !== null) {
            clearTimeout(timeoutData.tout);
            scheduleNextFrame(Date.now() - timeoutData.ms);
        }
    };

    function scheduleNextFrame(alreadyPassed) {
        var speedfactor = sliderstopToSpeedfactor(speedslider['value']);

        var speedlabel = document.getElementById('speedlabel');
        speedlabel.innerHTML = 'x' + speedfactor.toFixed(2);

        timeoutData = {
            tout : setTimeout(gameLoop, timeout(speedfactor) - (alreadyPassed ? alreadyPassed : 0)),
            ms : Date.now()
        };
    }

    function gameLoop() {
        passive = 1 - active;

        function collectPile() {
            Array.prototype.splice.apply(hands[active], [0, 0].concat(pile.reverse()));
            pile.length = 0;
        }
        
        var activeCard = hands[active].pop();
        if (activeCard === undefined) {
            if (pile.length) {
                collectPile();
                activeCard = hands[active].pop();
            }
            else {
                winner = passive;
                return;
            }
        }

        var topCard = pile.last();
        pile.push(activeCard);

        if (activeCard.takes(topCard)) {
            collectPile();
        }

        active = passive;
        redraw(hands, pile, active);
        
        scheduleNextFrame();
    }

    scheduleNextFrame();
}

function main() {
    // var gameboard = document.getElementById('gameboard');
    // var ctx = gameboard.getContext('2d');

    // ctx.fillStyle = '#F00';
    // ctx.fillRect(0, 0, 150, 675);

    papazgame();


}

main();