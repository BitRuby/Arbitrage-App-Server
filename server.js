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
const map_bittrex_summary = {
    "result[0].MarketName": "exchangeName",
    "result[0].MarketName": "exchangeCurrency1",
    "result[0].MarketName": "exchangeCurrency2",
    "result[0].Last": "lastPrice",
    "result[0].Bid": "bid",
    "result[0].Ask": "ask",
    "result[0].Volume": "volume",
    "result[0].Low": "lowPrice",
    "result[0].High": "highPrice",
    "result[0].PrevDay": "percentageChange"
}
const map_bitfinex_summary_1 = {
    "[0]": "data"
}
const map_bitfinex_summary_2 = {
    "data[0]": "exchangeName",
    "data[0]": "exchangeCurrency1",
    "data[0]": "exchangeCurrency2",
    "data[7]": "lastPrice",
    "data[1]": "bid",
    "data[3]": "ask",
    "data[8]": "volume",
    "data[10]": "lowPrice",
    "data[9]": "highPrice",
    "data[5]": "percentageChange"
}
const map_coinbase_summary = {
    null: "exchangeName",
    null: "exchangeCurrency1",
    null: "exchangeCurrency2",
    "price": "lastPrice",
    "bid": "bid",
    "ask": "ask",
    "volume": "volume",
    null: "lowPrice",
    null: "highPrice",
    null: "percentageChange"
}
const map_kraken_summary_1 = {
    "result.XETHZUSD":"data",
    "result.XLTCZUSD":"data",
    "result.ADAUSD":"data",
    "result.USDTZUSD":"data",
    "result.XXRPZUSD":"data",
    "result.XZECZUSD":"data",
}
const map_kraken_summary_2 = {
    null: "exchangeName",
    null: "exchangeCurrency1",
    null: "exchangeCurrency2",
    "data.c[0]": "lastPrice",
    "data.b[0]": "bid",
    "data.a[0]": "ask",
    "data.v[1]": "volume",
    "data.l[1]": "lowPrice",
    "data.h[1]": "highPrice",
    "data.o": "percentageChange"
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
        var dest = objectMapper(JSON.parse(body), map_kraken_1);
        var dest2 = objectMapper(dest, map_kraken_2);   
        res.send(dest2);
    });
});
app.route('/api/bittrex/summary/:c1/:c2').get((req, res) => {
    const c1 = req.params.c1.toUpperCase();  
    const c2 = req.params.c2.toUpperCase();
    Request.get( {url:`https://bittrex.com/api/v1.1/public/getmarketsummary?market=${c1}-${c2}`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
        if(error) {
            res.send(error);
            return console.dir('Bittrex summary: ' + error);  
        }
        body = JSON.parse(body);
        if(body.success==false) {
            res.send(body);
            return console.dir('Bittrex summary: ' + body.message);
        }
        var dest = objectMapper(body, map_bittrex_summary);
        dest.exchangeName = 'Bittrex';
        dest.exchangeCurrency1 = String(c1);
        dest.exchangeCurrency2 = String(c2);
        dest.percentageChange = ((dest.lastPrice-dest.percentageChange)/dest.percentageChange);
        res.send(dest);
    });
});
app.route('/api/bitfinex/summary/:c1/:c2').get((req, res) => {
    const c1 = req.params.c1.toUpperCase(); 
    const c2 = req.params.c2.toUpperCase();
    Request.get( {url:`https://api.bitfinex.com/v2/tickers?symbols=t${c2}${c1}`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
        if(error) {
            res.send(error);
            return console.dir('Bitfinex summary: ' + error);  
        }
        body = JSON.parse(body);
        if(body.length==0) {
            res.send(body);
            return console.dir('Bitfinex summary: Empty');
        }
        var dest = objectMapper(body, map_bitfinex_summary_1);
        var dest2 = objectMapper(dest, map_bitfinex_summary_2);
        dest2.exchangeName = 'Bitfinex';
        dest2.exchangeCurrency1 = String(c1);
        dest2.exchangeCurrency2 = String(c2);
        dest2.percentageChange = dest2.percentageChange/10000;
        res.send(dest2);
    });
});
app.route('/api/coinbase/summary/:c1/:c2').get((req, res) => {
    const c1 = req.params.c1.toUpperCase(); 
    const c2 = req.params.c2.toUpperCase();
    const stats = {};
    Request.get( {url:`https://api.pro.coinbase.com/products/${c2}-${c1}/stats?level=2`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
        if(error) {
            res.send(error);
            return console.dir('Coinbase summary: ' + error);  
        }
        body = JSON.parse(body);
        if(body.message) {
            res.send(body);
            return console.dir('Coinbase summary: ' + body.message);
        }
        stats.open = body.open;
        stats.high = body.high;
        stats.low = body.low;
    });
    Request.get( {url:`https://api.pro.coinbase.com/products/${c2}-${c1}/ticker?level=2`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
        if(error) {
            res.send(error);
            return console.dir('Coinbase summary: ' + error);  
        }
        body = JSON.parse(body);
        if(body.message) {
            res.send(body);
            return console.dir('Coinbase summary: ' + body.message);
        }
        var dest = objectMapper(body, map_coinbase_summary);
        dest.exchangeName = 'Coinbase';
        dest.exchangeCurrency1 = String(c1);
        dest.exchangeCurrency2 = String(c2);
        dest.highPrice = stats.high;
        dest.lowPrice = stats.low;
        dest.percentageChange = ((dest.lastPrice-stats.open)/stats.open);
        res.send(dest);
    });
});
app.route('/api/kraken/summary/:c1/:c2').get((req, res) => {
    const c1 = req.params.c1.toUpperCase(); 
    const c2 = req.params.c2.toUpperCase();
    Request.get( {url:`https://api.kraken.com/0/public/Ticker?pair=${c2}${c1}`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
        if(error) {
            res.send(error);
            return console.dir('Kraken summary: ' + error);  
        }
        body = JSON.parse(body);
        if(body.error.length>0) {
            res.send(body);
            return console.dir('Kraken summary: ' + body.error);
        }
        var dest = objectMapper(body, map_kraken_summary_1);
        var dest2 = objectMapper(dest, map_kraken_summary_2);
        dest2.exchangeName = 'Kraken';
        dest2.exchangeCurrency1 = String(c1);
        dest2.exchangeCurrency2 = String(c2);
        dest2.percentageChange = ((dest2.lastPrice-dest2.percentageChange)/dest2.percentageChange);
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