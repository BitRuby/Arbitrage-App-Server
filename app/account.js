const Request = require('request');
const CryptoJS  = require('crypto-js');
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