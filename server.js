const express = require('express');
const Request = require('request');
const objectMapper = require('object-mapper');

Request.defaults({
    headers: {'User-Agent': 'ua'}
});

const app = express();
app.listen(8000, () => {
    console.log('Server started on localhost:8000');
});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const map_bittrex = {
    "result.buy[].Quantity":"Bids[].Quantity",
    "result.buy[].Rate":"Bids[].Price",
    "result.sell[].Quantity":"Asks[].Quantity",
    "result.sell[].Rate":"Asks[].Price"
}
const map_bitfinex = {
    "bids[].amount":"Bids[].Quantity",
    "bids[].price":"Bids[].Price",
    "asks[].amount":"Asks[].Quantity",
    "asks[].price":"Asks[].Price"
}
const map_coinbase_1 = {
    "bids[]":"Bids[].data",
    "asks[]":"Asks[].data"
}
const map_coinbase_2 = {
    "Bids[].data[1]":"Bids[].Quantity",
    "Bids[].data[0]":"Bids[].Price",
    "Asks[].data[1]":"Asks[].Quantity",
    "Asks[].data[0]":"Asks[].Price"
}
const map_kraken_1 = {
    "result.XETHZUSD.bids[]":"Bids[].data",
    "result.XLTCZUSD.bids[]":"Bids[].data",
    "result.ADAUSD.bids[]":"Bids[].data",
    "result.USDTZUSD.bids[]":"Bids[].data",
    "result.XXRPZUSD.bids[]":"Bids[].data",
    "result.XZECZUSD.bids[]":"Bids[].data",
    "result.XETHZUSD.asks[]":"Asks[].data",
    "result.XLTCZUSD.asks[]":"Asks[].data",
    "result.ADAUSD.asks[]":"Asks[].data",
    "result.USDTZUSD.asks[]":"Asks[].data",
    "result.XXRPZUSD.asks[]":"Asks[].data",
    "result.XZECZUSD.asks[]":"Asks[].data",
}
const map_kraken_2 = {
    "Bids[].data[1]":"Bids[].Quantity",
    "Bids[].data[0]":"Bids[].Price",
    "Asks[].data[1]":"Asks[].Quantity",
    "Asks[].data[0]":"Asks[].Price"
}

app.route('/api/bittrex/orderbook/:c1/:c2').get((req, res) => {
    const c1 = req.params.c1; 
    const c2 = req.params.c2;
    Request.get(`https://bittrex.com/api/v1.1/public/getorderbook?market=${c2}-${c1}&type=both`, (error, response, body) => {
    if(error) {
        return console.dir('Bittrex orderbook' + error);
    }
    var dest = objectMapper(JSON.parse(body), map_bittrex);
    res.send(dest);
    });
});
app.route('/api/bitfinex/orderbook/:c1/:c2').get((req, res) => {
    const c1 = req.params.c1; 
    const c2 = req.params.c2;
    Request.get(`https://api.bitfinex.com/v1/book/${c1}${c2}?limit_bids=100&limit_asks=100`, (error, response, body) => {
    if(error) {
        return console.dir('Bitfinex orderbook' + error);
    }
    var dest = objectMapper(JSON.parse(body), map_bitfinex);
    res.send(dest);
    });
});
app.route('/api/coinbase/orderbook/:c1/:c2').get((req, res) => {
    const c1 = req.params.c1; 
    const c2 = req.params.c2;
    Request.get( {url:`https://api.pro.coinbase.com/products/${c1}-${c2}/book?level=2`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
    if(error) {
        return console.dir('Coinbase orderbook' + error);
    }
    var dest = objectMapper(JSON.parse(body), map_coinbase_1);
    var dest2 = objectMapper(dest, map_coinbase_2);   
    res.send(dest2);
    });
});
app.route('/api/kraken/orderbook/:c1/:c2').get((req, res) => {
    const c1 = req.params.c1; 
    const c2 = req.params.c2;
    Request.get( {url:`https://api.kraken.com/0/public/Depth?pair=${c1}${c2}&count=100`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
    if(error) {
        return console.dir('Kraken orderbook' + error);
    }
    var dest = objectMapper(JSON.parse(body), map_kraken_1);
    var dest2 = objectMapper(dest, map_kraken_2);   
    res.send(dest2);
    });
});
app.route('/api/exchange/name/:id').get((req, res) => {
    const id = req.params.id; 
    let data = {};
    switch(id) {
        case '1': data = {'name': 'Bittrex'};
    break;
        case '2': data = {'name': 'Bitfinex'};
    break;
        case '3': data = {'name': 'Coinbase'};
    break;
        case '4': data = {'name': 'Kraken'};
    break; 
        default: data = {'error': 'Invalid identificator.'};
    break;
    }
    res.send(data);
});
app.route('/api/exchange/fee/:id').get((req, res) => {
    const id = req.params.id; 
    let data = {};
    switch(id) {
        case '1': data ={'buyFee': 0.25, 'sellFee': 0.25};
    break;
        case '2': data = {'buyFee': 0.2, 'sellFee': 0.2};
    break;
        case '3': data = {'buyFee': 0.3, 'sellFee': 0.3};
    break;
        case '4': data = {'buyFee': 0.26, 'sellFee': 0.26};
    break; 
        default: data = {'error': 'Invalid identificator.'};
    break;
    }
    res.send(data);
});