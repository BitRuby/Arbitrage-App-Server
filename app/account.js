const Request = require('request');
const CryptoJS  = require('crypto-js');
const hmac_sha256 = require('crypto-js/hmac-sha256');
const hmac_sha512 = require('crypto-js/hmac-sha512');
const crypto = require('crypto');
const moment = require('moment');

exports.init = function(app) {
    app.route('/api/bittrex/connect/:apiKey/:apiSecret').get((req, res) => {
        const apiKey = req.params.apiKey;
        const apiSecret = req.params.apiSecret;
        const nonce = Math.floor(new Date().getTime() / 1000).toString();
        const url = `https://bittrex.com/api/v1.1/account/getbalances?apikey=${apiKey}&nonce=${nonce}`;
        const signature =  hmac_sha512(url, apiSecret);
        const options = {
            url: url,
            headers: {
              'apisign': signature
            }
          }
        Request.get(
            options,
            function(error, response, body) {
                if(error) {
                    res.send(error);
                    return console.dir('Bittrex private API connect: ' + error);  
                }
                body = JSON.parse(body);
                if(body.success == false) {
                    res.send(body);
                    return console.dir('Bittrex private API connect: ' + body.message);
                }
                if(body.success == true) {
                    req.session.bittrex = {};
                    req.session.bittrex.ApiKey = apiKey;
                    req.session.bittrex.ApiSecret = apiSecret;
                    res.send(body);
                }
            }
        );
    });
    app.route('/api/bittrex/getBittrex').get((req, res) => {

    const body = req.session;
    res.send(body);

    });
    app.route('/api/coinbase/connect/:apiKey/:apiSecret/:apiPassphrase').get((req, res) => {
        const apiKey = req.params.apiKey;
        const apiSecret = req.params.apiSecret;
        const passphrase = req.params.apiPassphrase;
        const nonce = Math.floor(new Date().getTime() / 1000).toString();
        const what = nonce + 'GET' + '/accounts';
        const key = Buffer(apiSecret, 'base64');
        const hmac = crypto.createHmac('sha256', key);
        const signature = hmac.update(what).digest('base64');
        const url = `https://api.pro.coinbase.com/accounts`;
        const options = {
            url: url,
            headers: {
                'CB-ACCESS-KEY': apiKey,
                'CB-ACCESS-SIGN': signature,
                'CB-ACCESS-TIMESTAMP': nonce,
                'CB-ACCESS-PASSPHRASE': passphrase
            }
        }
        Request.get(
            options,
            function(error, response, body) {
                if(error) {
                    res.send(error);
                    return console.dir('Coinbase private API connect: ' + error);  
                }
                body = JSON.parse(body);
                if(body.success == false) {
                    res.send(body);
                    return console.dir('Coinbase private API connect: ' + body.message);
                }
                if(body.success == true) {
                    req.session.coinbase = {};
                    req.session.coinbase.ApiKey = apiKey;
                    req.session.coinbase.ApiSecret = apiSecret;
                    req.session.coinbase.apiPassphrase = passphrase;
                    res.send(body);
                }
            }
        );
    });
    app.route('/api/kraken/connect').get((req, res) => {
        const apiKey = 'd+Mu/CLkMW4t37H7zvRyIk/yOJNc4BQqfiJX94JLdikd89sLOrqLkbmb';
        const apiSecret = 'TDDdH1AjZCc9VUagxL5hXWntCXKHxPxtYXlLnFZNAsDwk/0v7WQ/FBBd9UNJBEwfjUJBQXLLCTLKSeV1AyFBLA==';
        const nonce = new Date() * 1000; 
        let params = {};
		params.nonce = nonce;
        const url = 'https://api.kraken.com/0/private/Balance';
        const uri = '/0/private/Balance';
        const message = JSON.stringify(params);
        const secret_buffer = new Buffer(apiSecret, 'base64');
        const hash = new crypto.createHash('sha256');
        const hmac = new crypto.createHmac('sha512', secret_buffer);
        const hash_digest = hash.update(nonce + message).digest('binary');
        const hmac_digest = hmac.update(uri + hash_digest, 'binary').digest('base64');
        const options = {
            url: url,
            headers: {
                'API-Key': apiKey,
                'API-Sign': hmac_digest
            }
        }
        Request.post(
            options,
            function(error, response, body) {
                if(error) {
                    res.send(error);
                    return console.dir('Kraken private API connect: ' + error);  
                }
                body = JSON.stringify(response);
                res.send(response);
            }
        );
    });
    app.route('/api/binance/connect/:apiKey/:apiSecret').get((req, res) => {
        const apiKey = req.params.apiKey;
        const apiSecret = req.params.apiSecret;
        let nonce = new Date();
        nonce.setSeconds(nonce.getSeconds()-1);
        let data = {
            timestamp: nonce.getTime()
        };
        let query = Object.keys(data).reduce(function (a, k) {
            a.push(k + '=' + encodeURIComponent(data[k]));
            return a;
        }, []).join('&');
        const signature = crypto.createHmac('sha256', apiSecret).update(query).digest('hex');
        const url = 'https://api.binance.com/api/v3/account';
        const options = {
            url: url + '?' + query + '&signature=' + signature,
            headers: {
                'X-MBX-APIKEY': apiKey
            }
        }
        Request.get(
            options,
            function(error, response, body) {
                if(error) {
                    res.send(error);
                    return console.dir('Binance private API connect: ' + error);  
                }
                body = JSON.parse(body);
                res.send(body);
            }
        );
    });
    app.route('/api/p2pb2b/connect/:apiKey/:apiSecret').get((req, res) => {
        const apiKey = req.params.apiKey;
        const apiSecret = req.params.apiSecret;
		const request = '/api/v1/account/balances'; 
        const baseUrl = 'https://p2pb2b.io';
        let nonce = new Date().getTime()*1000;
        let data = {
            'request': request,
            'nonce': nonce
        };
        const payload = new Buffer(JSON.stringify(data)).toString("base64");
        const hmac = crypto.createHmac('sha512', apiSecret);
        const signature = hmac.update(payload).digest('hex');
        const options = {
            url: baseUrl + request,
            headers: {
                'X-TXC-APIKEY': apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': signature
            }
        }
        Request.post(
            options,
            function(error, response, body) {
                if(error) {
                    res.send(error);
                    return console.dir('P2PB2B private API connect: ' + error);  
                }
                body = JSON.parse(body);
                res.send(body);
            }
        );
    });
    app.route('/api/hitbtc/connect/:apiKey/:apiSecret').get((req, res) => {
        const apiKey = req.params.apiKey;
        const apiSecret = req.params.apiSecret;
        const url = `https://api.hitbtc.com/api/2`;
        const path = `/trading/balance`;
        const signature =  "Basic " + new Buffer(apiKey + ':' + apiSecret).toString("base64");
        const options = {
            url: `${url}${path}`,
            headers: {
                'Authorization': signature
            }
        }
        Request.get(
            options,
            function(error, response, body) {
                if(error) {
                    res.send(error);
                    return console.dir('HitBTC private API connect: ' + error);  
                }
                body = JSON.parse(body);
                if(body.error == true) {
                    res.send(body);
                    return console.dir('HitBTC private API connect: ' + body.error.message);
                }
                else {
                    res.send(body);
                }
            }
        );
    });
    app.route('/api/okex/connect/:apiKey/:apiSecret').get((req, res) => {
        const apiKey = req.params.apiKey;
        const apiSecret = req.params.apiSecret;
        const passphrase = '7q4yqYfB68EG8BS';
        const method = 'GET';
        const url = `https://okex.com`;
        const path = `/api/account/v3/wallet`;
        let nonce = moment().toISOString();
        const body = {

        }
        const sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(nonce + method + path, apiSecret))
        const options = {
            url: `${url}${path}`,
            headers: {
                'OK-ACCESS-KEY': apiKey,
                'OK-ACCESS-SIGN': sign,
                'OK-ACCESS-TIMESTAMP': nonce,
                'OK-ACCESS-PASSPHRASE': passphrase,
            }
        }
        Request.get(
            options,
            function(error, response, body) {
                if(error) {
                    res.send(error);
                    return console.dir('OKEX private API connect: ' + error);  
                }
                body = JSON.parse(body);
                res.send(body);
            }
        );
    });
}