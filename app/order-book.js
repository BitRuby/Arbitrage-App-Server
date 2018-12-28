const objectMapper = require('object-mapper');
const markets = require('./data/markets.json');
const markets_export = require('./data/markets_export.json');
const exchanges = require('./data/exchanges.json');
const rp = require('request-promise');
exports.init = function(app) { 
    const map_bittrex = {
        "result.buy[].Quantity":"Bids[].Quantity",
        "result.buy[].Rate":"Bids[].Price",
        "result.sell[].Quantity":"Asks[].Quantity",
        "result.sell[].Rate":"Asks[].Price"
    }
    const map_binance_1 = {
        "bids[]": "Bids[].data",
        "asks[]": "Asks[].data"
    }
    const map_binance_2 = {
        "Bids[].data[1]":"Bids[].Quantity",
        "Bids[].data[0]":"Bids[].Price",
        "Asks[].data[1]":"Asks[].Quantity",
        "Asks[].data[0]":"Asks[].Price"
    }
    const map_hitbtc = {
        "bid[].size":"Bids[].Quantity",
        "bid[].price":"Bids[].Price",
        "ask[].size":"Asks[].Quantity",
        "ask[].price":"Asks[].Price"
    }
    const map_okex_1 = {
        "bids[]": "Bids[].data",
        "asks[]": "Asks[].data"
    }
    const map_okex_2 = {
        "Bids[].data[1]":"Bids[].Quantity",
        "Bids[].data[0]":"Bids[].Price",
        "Asks[].data[1]":"Asks[].Quantity",
        "Asks[].data[0]":"Asks[].Price"
    }
    const getOrderBook = function(exchangeId, currency1, currency2) {
        let c1 = currency1.toUpperCase(); 
        let c2 = currency2.toUpperCase();
        if (exchangeId == 3) { 
            if (c1 === 'USDT' && c2 === 'XRP') {
                c1 = 'USDT';
            }
            else {
                c1 = 'USD'; 
            }
        }
        const id = parseInt(exchangeId);
        const obj = {};
        obj.method = 'GET';
        obj.json = true;
        obj.headers = {
            'User-Agent': 'request'
        }
        switch (id) {
            case 1: 
                obj.uri = `https://bittrex.com/api/v1.1/public/getorderbook?market=${c1}-${c2}&type=both`;
            break;
            case 2:
                obj.uri = `https://api.binance.com/api/v1/depth?symbol=${c2}${c1}`;
            break;
            case 3:
                obj.uri = `https://api.hitbtc.com/api/2/public/orderbook/${c2}${c1}`;
            break;
            case 4:
                obj.uri = `https://www.okex.com/api/spot/v3/instruments/${c2}-${c1}/book?size=100`
            break;
        }
        return obj;
    }
    const jsonMapper = function(exchangeId, body) {
        const id = parseInt(exchangeId);
        obj = {};
        switch (id) {
            case 1: 
                obj = objectMapper(body, map_bittrex);
            break;
            case 2:      
                obj = objectMapper(objectMapper(body, map_binance_1), map_binance_2);
            break;
            case 3:
                obj = objectMapper(body, map_hitbtc);
            break;
            case 4:
                obj = objectMapper(objectMapper(body, map_okex_1), map_okex_2);
            break;
        }
        return obj;
    }
    app.route('/api/orderbook/:marketId').get((req,res) => {
        const marketId = req.params.marketId; 
        let json = markets_export;
        let ps = [];
        let x = 0;
        const search = json.Markets.find(item => item.id == marketId);
        try {
            if (search === undefined) throw 'Cannot find specified identifier';
        }
        catch(err) {
            console.log('Orderbook by marketId: ' + err);
            res.send({error: err});
            return;
        }
        ret = [];
        for ( let j = 0; j < search.exchanges.length; j++ ) {
            ps.push( rp(getOrderBook(search.exchanges[j], search.primary, search.secondary)) );
        }
        Promise.all(ps)
        .then((results) => {
            for ( let j = 0; j < search.exchanges.length; j++ ) {
                ret[j] = {};
                ret[j].name = exchanges.Exchanges.find(item => item.id == search.exchanges[j]).name;
                ret[j].data = jsonMapper(search.exchanges[j], results[x++]);
            }
            res.send(ret);
        }).catch(err => console.log('Orderbook error: ' + err));  
    })
    app.route('/api/orderbook').get((req,res) => {
        let json_data = markets;
        let ps = [];
        let x = 0;
        for ( let i = 0; i < json_data.Markets.length; i++ ) {
            for ( let j = 0; j < json_data.Markets[i].exchanges.length; j++ ) {
                ps.push( rp(getOrderBook(json_data.Markets[i].exchanges[j], json_data.Markets[i].primary, json_data.Markets[i].secondary)) );
            }
        }
        Promise.all(ps)
        .then((results) => {
            for ( let i = 0; i < json_data.Markets.length; i++ ) {
                json_data.Markets[i].data = [];
                for ( let j = 0; j < json_data.Markets[i].exchanges.length; j++ ) {
                    json_data.Markets[i].data[j] = {};
                    json_data.Markets[i].data[j].name = exchanges.Exchanges.find(item => item.id == json_data.Markets[i].exchanges[j]).name;
                    json_data.Markets[i].data[j].data = jsonMapper(json_data.Markets[i].exchanges[j], results[x++]);
                }
            }
            res.send(json_data);
        }).catch(err => console.log('Orderbook error: ' + err));  
    })
}