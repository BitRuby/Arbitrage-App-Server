const Request = require('request');
const objectMapper = require('object-mapper');
const tools = require('./tools.js');

exports.init = function (app) {
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
        "openPrice": "percentageChange"
    }
    const map_hitbtc = {
        null: "exchangeName",
        null: "exchangeCurrency1",
        null: "exchangeCurrency2",
        "last": "lastPrice",
        "bid": "bid",
        "ask": "ask",
        "volume": "volume",
        "low": "lowPrice",
        "high": "highPrice",
        "open": "percentageChange"
    }
    const map_okex = {
        null: "exchangeName",
        null: "exchangeCurrency1",
        null: "exchangeCurrency2",
        "last": "lastPrice",
        "bid": "bid",
        "ask": "ask",
        "base_volume_24h": "volume",
        "low_24h": "lowPrice",
        "high_24h": "highPrice",
        "open_24h": "percentageChange"
    }
    app.route('/api/bittrex/summary/:c1/:c2').get((req, res) => {
        const c1 = req.params.c1.toUpperCase();
        const c2 = req.params.c2.toUpperCase();
        Request.get({
            url: `https://bittrex.com/api/v1.1/public/getmarketsummary?market=${c1}-${c2}`,
            headers: {
                'User-Agent': 'request'
            }
        }, (error, response, body) => {
            if (error) {
                res.send(error);
                return console.dir('Bittrex summary: ' + error);
            }
            body = JSON.parse(body);
            if (body.success == false) {
                res.send(body);
                return console.dir('Bittrex summary: ' + body.message);
            }
            var dest = objectMapper(body, map_bittrex_summary);
            dest.exchangeName = 'Bittrex';
            dest.exchangeCurrency1 = String(c1);
            dest.exchangeCurrency2 = String(c2);
            dest.percentageChange = ((dest.lastPrice - dest.percentageChange) / dest.percentageChange);
            res.send(dest);
        });
    });

    app.route('/api/binance/summary/:c1/:c2').get((req, res) => {
        const c1 = req.params.c1.toUpperCase();
        const c2 = req.params.c2.toUpperCase();
        Request.get({
            url: `https://api.binance.com/api/v1/ticker/24hr?symbol=${c2}${c1}`,
            headers: {
                'User-Agent': 'request'
            }
        }, (error, response, body) => {
            if (error) {
                res.send(error);
                return console.dir('Binance summary: ' + error);
            }
            body = JSON.parse(body);
            if (tools.isEmpty(body.msg) === false) {
                res.send(body);
                return console.dir('Binance summary: ' + body);
            }
            var dest = objectMapper(body, map_binance);
            dest.exchangeName = 'Binance';
            dest.exchangeCurrency1 = String(c1);
            dest.exchangeCurrency2 = String(c2);
            dest.percentageChange = ((dest.lastPrice - dest.percentageChange) / dest.percentageChange);
            res.send(dest);
        });
    });
    app.route('/api/hitbtc/summary/:c1/:c2').get((req, res) => {
        let c1 = req.params.c1.toUpperCase();
        let c2 = req.params.c2.toUpperCase();
        if (c1 === 'USDT' && c2 === 'XRP') {
            c1 = 'USDT';
        } else {
            c1 = 'USD';
        }
        Request.get({
            url: `https://api.hitbtc.com/api/2/public/ticker/${c2}${c1}`,
            headers: {
                'User-Agent': 'request'
            }
        }, (error, response, body) => {
            if (error) {
                res.send(error);
                return console.dir('HitBTC summary: ' + error);
            }
            body = JSON.parse(body);
            if (tools.isEmpty(body.error) === false) {
                res.send(body);
                return console.dir('HitBTC summary: ' + body);
            }
            var dest = objectMapper(body, map_hitbtc);
            dest.exchangeName = 'HitBTC';
            dest.exchangeCurrency1 = String(c1);
            dest.exchangeCurrency2 = String(c2);
            dest.percentageChange = ((dest.lastPrice - dest.percentageChange) / dest.percentageChange);
            res.send(dest);
        });
    });
    app.route('/api/okex/summary/:c1/:c2').get((req, res) => {
        let c1 = req.params.c1.toUpperCase();
        let c2 = req.params.c2.toUpperCase();
        Request.get({
            url: `https://www.okex.com/api/spot/v3/instruments/${c2}-${c1}/ticker`,
            headers: {
                'User-Agent': 'request'
            }
        }, (error, response, body) => {
            if (error) {
                res.send(error);
                return console.dir('HitBTC summary: ' + error);
            }
            body = JSON.parse(body);
            if (tools.isEmpty(body.message) === false) {
                res.send(body);
                return console.dir('OKEx summary: ' + body);
            }
            var dest = objectMapper(body, map_okex);
            dest.exchangeName = 'OKEx';
            dest.exchangeCurrency1 = String(c1);
            dest.exchangeCurrency2 = String(c2);
            dest.percentageChange = ((dest.lastPrice - dest.percentageChange) / dest.percentageChange);
            res.send(dest);
        });
    });
}