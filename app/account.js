const CryptoJS = require('crypto-js');
const hmac_sha512 = require('crypto-js/hmac-sha512');
const crypto = require('crypto');
const moment = require('moment');
const rp = require('request-promise');
const objectMapper = require('object-mapper');
const user = require('./data/user.json');
const market = require('./data/markets.json');

const getBittrexUserBalances = function () {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    const search = user.User.find(item => item.id == 1);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    const nonce = Math.floor(new Date().getTime() / 1000).toString();
    obj.uri = `https://bittrex.com/api/v1.1/account/getbalances?apikey=${apiKey}&nonce=${nonce}`;
    const signature = hmac_sha512(obj.uri, apiSecret);
    obj.headers = {
        'User-Agent': 'request',
        'apisign': signature
    }
    return obj;
}

const getBinanceUserBalances = function () {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    const search = user.User.find(item => item.id == 2);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    let nonce = new Date();
    nonce.setSeconds(nonce.getSeconds() - 1);
    let data = {
        timestamp: nonce.getTime()
    };
    let query = Object.keys(data).reduce(function (a, k) {
        a.push(k + '=' + encodeURIComponent(data[k]));
        return a;
    }, []).join('&');
    const signature = crypto.createHmac('sha256', apiSecret).update(query).digest('hex');
    const url = 'https://api.binance.com/api/v3/account';
    obj.uri = url + '?' + query + '&signature=' + signature;
    obj.headers = {
        'User-Agent': 'request',
        'X-MBX-APIKEY': apiKey
    }
    return obj;
}

const getHitbtcUserBalances = function () {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    const search = user.User.find(item => item.id == 3);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    const url = `https://api.hitbtc.com/api/2`;
    const path = `/trading/balance`;
    const signature = "Basic " + new Buffer(apiKey + ':' + apiSecret).toString("base64");
    obj.uri = url + path;
    obj.headers = {
        'User-Agent': 'request',
        'Authorization': signature
    }
    return obj;
}

const getOkexUserBalances = function () {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    const search = user.User.find(item => item.id == 4);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    const passphrase = search.PASSPHRASE;
    const url = `https://okex.com`;
    const path = `/api/account/v3/wallet`;
    let nonce = moment().toISOString();
    const body = {}
    const sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(nonce + obj.method + path, apiSecret))
    obj.uri = url + path;
    obj.headers = {
        'User-Agent': 'request',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': sign,
        'OK-ACCESS-TIMESTAMP': nonce,
        'OK-ACCESS-PASSPHRASE': passphrase,
    }
    return obj;
}

const getBittrexUserOrders = function (c1, c2) {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    const search = user.User.find(item => item.id == 1);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    const nonce = Math.floor(new Date().getTime() / 1000).toString();
    obj.uri = `https://bittrex.com/api/v1.1/account/getorderhistory?apikey=${apiKey}&nonce=${nonce}&market=${c1}-${c2}`;
    const signature = hmac_sha512(obj.uri, apiSecret);
    obj.headers = {
        'User-Agent': 'request',
        'apisign': signature
    }
    return obj;
}

const getBinanceUserOrders = function (c1, c2) {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    const search = user.User.find(item => item.id == 2);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    let nonce = new Date();
    nonce.setSeconds(nonce.getSeconds() - 1);
    let data = {
        symbol: `${c2}${c1}`,
        timestamp: nonce.getTime()
    };
    let query = Object.keys(data).reduce(function (a, k) {
        a.push(k + '=' + encodeURIComponent(data[k]));
        return a;
    }, []).join('&');
    const signature = crypto.createHmac('sha256', apiSecret).update(query).digest('hex');
    const url = 'https://api.binance.com/api/v3/allOrders';
    obj.uri = url + '?' + query + '&signature=' + signature;
    obj.headers = {
        'User-Agent': 'request',
        'X-MBX-APIKEY': apiKey
    }
    return obj;
}

const getHitbtcUserOrders = function (c1, c2) {
    if (c1 === 'USDT' && c2 === 'XRP') {
        c1 = 'USDT';
    } else {
        c1 = 'USD';
    }
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    const search = user.User.find(item => item.id == 3);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    const url = `https://api.hitbtc.com/api/2`;
    const path = `/history/order?symbol=${c2}${c1}`;
    const signature = "Basic " + new Buffer(apiKey + ':' + apiSecret).toString("base64");
    obj.uri = url + path;
    obj.headers = {
        'User-Agent': 'request',
        'Authorization': signature
    }
    return obj;
}

const getOkexUserOrders = function (c1, c2) {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    const search = user.User.find(item => item.id == 4);
    const apiKey = search.PK;
    const apiSecret = search.PS;
    const passphrase = search.PASSPHRASE;
    const url = `https://okex.com`;
    const path = `/api/spot/v3/orders?instrument_id=${c2}-${c1}&status=filled`;
    let nonce = moment().toISOString();
    const body = {}
    const sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(nonce + obj.method + path, apiSecret))
    obj.uri = url + path;
    obj.headers = {
        'User-Agent': 'request',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': sign,
        'OK-ACCESS-TIMESTAMP': nonce,
        'OK-ACCESS-PASSPHRASE': passphrase,
    }
    return obj;
}

exports.getRequestedUserBalance = function (id) {
    let promise;
    switch (id) {
        case 1:
            promise = rp(getBittrexUserBalances());
            break;
        case 2:
            promise = rp(getBinanceUserBalances());
            break;
        case 3:
            promise = rp(getHitbtcUserBalances());
            break;
        case 4:
            promise = rp(getOkexUserBalances());
            break;
    }
    return promise;
}

exports.getRequestedUserOrders = function (id) {
    let ps = [];
    let isFound = false;
    const search = market.Markets;
    try {
        if (search === undefined) throw 'Cannot find specified identifier';
    } catch (err) {
        console.log('RequestedUserOrders by marketId: ' + err);
        return;
    }
    for (let j = 0; j < search.length; j++) {
        for (let i = 0; i < search[j].exchanges.length; i++) {
            if (search[j].exchanges[i] == id) {
                switch (id) {
                    case 1:
                        ps.push(rp(getBittrexUserOrders(search[j].primary, search[j].secondary)));
                        break;
                    case 2:
                        ps.push(rp(getBinanceUserOrders(search[j].primary, search[j].secondary)));
                        break;
                    case 3:
                        ps.push(rp(getHitbtcUserOrders(search[j].primary, search[j].secondary)));
                        break;
                    case 4:
                        ps.push(rp(getOkexUserOrders(search[j].primary, search[j].secondary)));
                        break;
                }
            }
        }
    }
    return ps;
}

exports.deleteZeroBalances = function (dataArr) {
    let arr = [];
    for (let i = 0; i < dataArr.length; i++) {
        if (dataArr[i].Balance != '0') {
            arr.push(dataArr[i]);
        }
    }
    return arr;
}

const map_bittrex_balance = {
    "result[].Currency": "[].Currency",
    "result[].Balance": "[].Balance",
    "result[].Available": "[].Available"
}
const map_binance_balance = {
    "balances[].asset": "[].Currency",
    "balances[].free": "[].Balance",
    "balances[].locked": "[].Available"
}
const map_hitbtc_balance = {
    "[].currency": "[].Currency",
    "[].available": "[].Balance",
    "[].reserved": "[].Available"
}
const map_okex_balance = {
    "[].currency": "[].Currency",
    "[].balance": "[].Balance",
    "[].available": "[].Available"
}
const map_bittrex_orders = {
    "[].result[].Exchange": "[].Exchange",
    "[].result[].Timestamp": "[].Timestamp",
    "[].result[].OrderType": "[].OrderType",
    "[].result[].Quantity": "[].Quantity",
    "[].result[].Price": "[].Price",
    "[].result[].Commision": "[].Fee"
}
const map_binance_orders = {
    "[].[].symbol": "[].Exchange",
    "[].[].time": "[].Timestamp",
    "[].[].side": "[].OrderType",
    "[].[].origQty": "[].Quantity",
    "[].[].price": "[].Price",
    "0.1": "[].Fee"
}
const map_hitbtc_orders = {
    "[].[].symbol": "[].Exchange",
    "[].[].timestamp": "[].Timestamp",
    "[].[].side": "[].OrderType",
    "[].[].quantity": "[].Quantity",
    "[].[].price": "[].Price",
    "[].[].fee": "[].Fee"
}
const map_okex_orders = {
    "[].[].instrument_id": "[].Exchange",
    "[].[].timestamp": "[].Timestamp",
    "[].[].side": "[].OrderType",
    "[].[].size": "[].Quantity",
    "[].[].price": "[].Price",
    "0.15": "[].Fee"
}

exports.userBalanceMapper = function (exchangeId, body) {
    const id = parseInt(exchangeId);
    obj = {};
    switch (id) {
        case 1:
            obj = objectMapper(body, map_bittrex_balance);
            break;
        case 2:
            obj = objectMapper(body, map_binance_balance);
            break;
        case 3:
            obj = objectMapper(body, map_hitbtc_balance);
            break;
        case 4:
            obj = objectMapper(body, map_okex_balance);
            break;
    }
    return obj;
}

exports.userOrdersMapper = function (exchangeId, body) {
    const id = parseInt(exchangeId);
    obj = {};
    switch (id) {
        case 1:
            obj = objectMapper(body, map_bittrex_orders);
            break;
        case 2:
            obj = objectMapper(body, map_binance_orders);
            break;
        case 3:
            obj = objectMapper(body, map_hitbtc_orders);
            break;
        case 4:
            obj = objectMapper(body, map_okdex_orders);
            break;
    }
    return obj;
}