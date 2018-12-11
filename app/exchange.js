exports.init = function(app) {
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
            case '5': data = {'name': 'Binance'};
        break; 
            case '6': data = {'name': 'P2PB2B'};
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
            case '5': data = {'buyFee': 0.1, 'sellFee': 0.1};
        break; 
            case '6': data = {'buyFee': 0.2, 'sellFee': 0.2};
        break; 
            default: data = {'error': 'Invalid identificator.'};
        break;
        }
        res.send(data);
    });
}