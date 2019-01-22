const CryptoJS = require('crypto-js');
const hmac_sha512 = require('crypto-js/hmac-sha512');
const crypto = require('crypto');
const moment = require('moment');
const rp = require('request-promise');
const objectMapper = require('object-mapper');
const user = require('./data/user.json');
const market = require('./data/markets.json');

const bittrexTrade = function (c1, c2, quantity, rate, side) {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    const search = user.User.find(item => item.id == 1);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    const nonce = Math.floor(new Date().getTime() / 1000).toString();
    obj.uri = `https://bittrex.com/api/v1.1/market/${side}limit?apikey=${apiKey}&nonce=${nonce}&market=${c1}-${c2}&quantity=${quantity}&rate=${rate}`;
    const signature = hmac_sha512(obj.uri, apiSecret);
    obj.headers = {
        'User-Agent': 'request',
        'apisign': signature
    }
    return obj;
}

const binanceTrade = function (c1, c2, quantity, rate, side) {
    const obj = {};
    obj.method = 'POST';
    obj.json = true;
    const search = user.User.find(item => item.id == 2);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    let nonce = new Date();
    nonce.setSeconds(nonce.getSeconds() - 1);
    let data = {
        symbol: `${c2}${c1}`,
        side: side.toUpperCase(),
        type: 'LIMIT_MAKER',
        quantity: quantity,
        price: rate,
        timestamp: nonce.getTime()
    };
    let query = Object.keys(data).reduce(function (a, k) {
        a.push(k + '=' + encodeURIComponent(data[k]));
        return a;
    }, []).join('&');
    const signature = crypto.createHmac('sha256', apiSecret).update(query).digest('hex');
    const url = 'https://api.binance.com/api/v3/order';
    obj.uri = url + '?' + query + '&signature=' + signature;
    obj.headers = {
        'User-Agent': 'request',
        'X-MBX-APIKEY': apiKey
    }
    return obj;
}


const hitbtcTrade = function (c1, c2, quantity, rate, side) {
    if (c1 === 'USDT' && c2 === 'XRP') {
        c1 = 'USDT';
    } else {
        c1 = 'USD';
    }
    const obj = {};
    obj.method = 'POST';
    obj.json = true;
    const search = user.User.find(item => item.id == 3);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    const url = `https://api.hitbtc.com/api/2`;
    const path = `/order`;
    const signature = "Basic " + new Buffer(apiKey + ':' + apiSecret).toString("base64");
    obj.uri = url + path;
    obj.body = {
        'symbol': `${c2}${c1}`,
        'side': side,
        'quantity': quantity,
        'price': rate
    }
    obj.headers = {
        'User-Agent': 'request',
        'Authorization': signature
    }
    return obj;
}

const okexTrade = function (c1, c2, quantity, rate, side) {
    const obj = {};
    obj.method = 'POST';
    obj.json = true;
    const search = user.User.find(item => item.id == 4);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    const passphrase = search.PASSPHRASE;
    const url = `https://okex.com`;
    const path = `/api/spot/v3/orders`;
    obj.body = {
        'instrument_id': `${c2}${c1}`,
        'side': side,
        'type': 'limit',
        'size': quantity,
        'price': rate,
        'margin_trading': 1
    }
    let nonce = moment().toISOString();
    const sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(nonce + obj.method + path, apiSecret))
    obj.uri = url + path + JSON.stringify(obj.body);
    obj.headers = {
        'User-Agent': 'request',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': sign,
        'OK-ACCESS-TIMESTAMP': nonce,
        'OK-ACCESS-PASSPHRASE': passphrase,
    }
    return obj;
}

exports.putOrder = function (id, c1, c2, quantity, rate, side) {
    let promise;
    switch (id) {
        case 1:
            promise = rp(bittrexTrade(c1, c2, quantity, rate, side));
            break;
        case 2:
            promise = rp(binanceTrade(c1, c2, quantity, rate, side));
            break;
        case 3:
            promise = rp(hitbtcTrade(c1, c2, quantity, rate, side));
            break;
        case 4:
            promise = rp(okexTrade(c1, c2, quantity, rate, side));
            break;
    }
    return promise;
}