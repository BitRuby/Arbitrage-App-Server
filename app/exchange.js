const exchanges = require('./data/exchanges.json');
const markets = require('./data/markets.json');

exports.init = function(app) {
    app.route('/api/exchange/:id').get((req, res) => {
        const id = req.params.id; 
        const search = exchanges.Exchanges.find(item => item.id == id);
        if ( search !== undefined ) {
            res.send(search);
        }
        else {
            res.send({"Error": "Invalid exchange identificator."});
        }
    });
    app.route('/api/exchanges').get((req, res) => {
        res.send(exchanges);
    });
}