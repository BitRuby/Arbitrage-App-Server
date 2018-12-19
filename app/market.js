const markets = require('./data/markets.json');

exports.init = function(app) {
    app.route('/api/market/:id').get((req, res) => {
        const id = req.params.id; 
        const search = markets.Markets.find(item => item.id == id);
        if ( search !== undefined ) {
            res.send(search);
        }
        else {
            res.send({"Error": "Invalid market identificator."});
        }
    });
    app.route('/api/markets').get((req, res) => {
        res.send(markets);
    });
}