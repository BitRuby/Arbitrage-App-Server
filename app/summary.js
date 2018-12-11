const Request = require('request');
const async = require('async');
const objectMapper = require('object-mapper');

exports.init = function(app) {
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
    const map_binance = {
        null: "exchangeName",
        null: "exchangeCurrency1",
        null: "exchangeCurrency2",
        "lastPrice": "lastPrice",
        "bidPrice": "bid",
        "askPrice": "ask",
        "volume": "volume",
        "lowPrice": "lowPrice",
        "highPrice": "highPrice",
        "priceChange": "percentageChange"
    }
    const map_p2pb2b = {
        null: "exchangeName",
        null: "exchangeCurrency1",
        null: "exchangeCurrency2",
        "result.last": "lastPrice",
        "result.bid": "bid",
        "result.ask": "ask",
        "result.volume": "volume",
        "result.low": "lowPrice",
        "result.high": "highPrice",
        "result.open": "percentageChange"
    }

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
        async.parallel([
            function (callback) {
                const stats = {};
                Request.get( {url:`https://api.pro.coinbase.com/products/${c2}-${c1}/stats?level=2`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
                    if(error) {
                        callback(error, null);
                        return console.dir("Coinbase summary:: First request: " + error);
                    }
                    body = JSON.parse(body);
                    if(body.message) {
                        callback(body.message, null);
                        return console.dir("Coinbase summary:: First request: " + error);
                    }
                    stats.open = body.open;
                    stats.high = body.high;
                    stats.low = body.low;
                    callback(null, stats);
                });
            },
            function (callback) {
                Request.get( {url:`https://api.pro.coinbase.com/products/${c2}-${c1}/ticker?level=2`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
                    if(error) {
                        callback(error, null);
                        return console.dir('Coinbase summary:: Second request: ' + error);  
                    }
                    body = JSON.parse(body);
                    if(body.message) {
                        callback(body, null);
                        return console.dir('Coinbase summary:: Second request: ' + body.message);
                    }
                    callback(null, body);
                });
            }],
            function (err, result) {
                var dest = objectMapper(result[1], map_coinbase_summary);
                dest.exchangeName = 'Coinbase';
                dest.exchangeCurrency1 = String(c1);
                dest.exchangeCurrency2 = String(c2);
                dest.highPrice = result[0].high;
                dest.lowPrice = result[0].low;
                dest.percentageChange = ((dest.lastPrice-result[0].open)/result[0].open);
                res.send(dest);
            }
        );
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
    app.route('/api/binance/summary/:c1/:c2').get((req, res) => {
        const c1 = req.params.c1.toUpperCase(); 
        const c2 = req.params.c2.toUpperCase();
        Request.get( {url:`https://api.binance.com/api/v1/ticker/24hr?symbol=${c1}${c2}`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
            if(error) {
                res.send(error);
                return console.dir('Binance summary: ' + error);  
            }
            body = JSON.parse(body);
            if(body.code != undefined) {
                res.send(body);
                return console.dir('Binance orderbook: ' + body.msg);
            }
            var dest = objectMapper(body, map_binance);
            dest.exchangeName = 'Binance';
            dest.exchangeCurrency1 = String(c1);
            dest.exchangeCurrency2 = String(c2);
            res.send(dest);
        });
    });
    app.route('/api/p2pb2b/summary/:c1/:c2').get((req, res) => {
        const c1 = req.params.c1.toUpperCase(); 
        const c2 = req.params.c2.toUpperCase();
        Request.get( {url:`https://p2pb2b.io/api/v1/public/ticker?market=${c2}_${c1}`, headers: {'User-Agent': 'request'}},  (error, response, body) => {
            if(error) {
                res.send(error);
                return console.dir('P2PB2B summary: ' + error);  
            }
            body = JSON.parse(body);
            if(body.success==false) {
                res.send(body);
                return console.dir('P2PB2B summary: ' + body.message);
            }
            var dest = objectMapper(body, map_p2pb2b);
            dest.exchangeName = 'P2PB2B';
            dest.exchangeCurrency1 = String(c1);
            dest.exchangeCurrency2 = String(c2);
            dest.percentageChange = ((dest.lastPrice-dest.percentageChange)/dest.percentageChange);
            res.send(dest);
        });
    });
}