const objectMapper = require('object-mapper');
const Request = require('request');

exports.init = function(app) { 
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
        const c1 = req.params.c1.toUpperCase(); 
        const c2 = req.params.c2.toUpperCase();
        Request.get(`https://bittrex.com/api/v1.1/public/getorderbook?market=${c2}-${c1}&type=both`, (error, response, body) => {
            if(error) {
                res.send(error);
                return console.dir('Bittrex summary: ' + error);  
            }
            body = JSON.parse(body);
            if(body.success==false) {
                res.send(body);
                return console.dir('Bittrex orderbook: ' + body.message);
            }
            var dest = objectMapper(body, map_bittrex);
            res.send(dest);
        });
    });
    app.route('/api/bitfinex/orderbook/:c1/:c2').get((req, res) => {
        const c1 = req.params.c1.toUpperCase(); 
        const c2 = req.params.c2.toUpperCase();
        Request.get(`https://api.bitfinex.com/v1/book/${c1}${c2}?limit_bids=100&limit_asks=100`, (error, response, body) => {
            if(error) {
                res.send(error);
                return console.dir('Bitfinex orderbook' + error);
            }
            body = JSON.parse(body);
            if(body.message=='Unknown symbol') {
                res.send(body);
                return console.dir('Bittrex orderbook: ' + body.message);
            }
            var dest = objectMapper(body, map_bitfinex);
            res.send(dest);
        });
    });
    app.route('/api/coinbase/orderbook/:c1/:c2').get((req, res) => {
        const c1 = req.params.c1.toUpperCase(); 
        const c2 = req.params.c2.toUpperCase();
        Request.get( {url:`https://api.pro.coinbase.com/products/${c1}-${c2}/book?level=2`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
            if(error) {
                res.send(error);
                return console.dir('Coinbase summary: ' + error);  
            }
            body = JSON.parse(body);
            if(body.message) {
                res.send(body);
                return console.dir('Coinbase summary: ' + body.message);
            }
            var dest = objectMapper(body, map_coinbase_1);
            var dest2 = objectMapper(dest, map_coinbase_2);   
            res.send(dest2);
        });
    });
    app.route('/api/kraken/orderbook/:c1/:c2').get((req, res) => {
        const c1 = req.params.c1.toUpperCase(); 
        const c2 = req.params.c2.toUpperCase();
        Request.get( {url:`https://api.kraken.com/0/public/Depth?pair=${c1}${c2}&count=100`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
            if(error) {
                res.send(error);
                return console.dir('Kraken summary: ' + error);  
            }
            body = JSON.parse(body);
            if(body.error.length>0) {
                res.send(body);
                return console.dir('Kraken summary: ' + body.error);
            }
            var dest = objectMapper(body, map_kraken_1);
            var dest2 = objectMapper(dest, map_kraken_2);   
            res.send(dest2);
        });
    });
}