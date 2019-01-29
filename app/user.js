const account = require('./account');
const account_mock = require('./account_mock');
const trade = require('./trade');
const trade_mock = require('./trade_mock');

exports.init = function (app) {
    app.route('/api/user/balances/:id').get((req, res) => {

        const id = parseInt(req.params.id, 10);
        Promise.resolve(account.getRequestedUserBalance(id)).then((results) => {
            const mapped = account.userBalanceMapper(id, results);
            const removed = account.deleteZeroBalances(mapped);
            res.send(removed);
        }).catch((error) => {
            res.send(error);
        });

    });

    app.route('/api/user/orders/:id').get((req, res) => {

        const id = parseInt(req.params.id, 10);
        Promise.all(account.getRequestedUserOrders(id)).then((results) => {
            const mapped = account.userOrdersMapper(id, results);
            res.send(mapped);
        }).catch((error) => {
            res.send(error);
        });

    });

    app.route('/api/user/balances_mock/:id').get((req, res) => {

        const id = parseInt(req.params.id, 10);
        Promise.resolve(account_mock.getRequestedUserBalance(id)).then((results) => {
            res.send(results.balances);
        }).catch((error) => {
            res.send(error);
        });

    });

    app.route('/api/user/orders_mock/:id').get((req, res) => {

        const id = parseInt(req.params.id, 10);
        Promise.resolve(account_mock.getRequestedUserOrders(id)).then((results) => {
            res.send(results.orders);
        }).catch((error) => {
            res.send(error);
        });

    });

    app.route('/api/user/trade/sell/:id/:c1/:c2/:quantity/:rate').get((req, res) => {
        const c1 = req.params.c1;
        const c2 = req.params.c2;
        const quantity = parseFloat(req.params.quantity);
        const rate = parseFloat(req.params.rate);
        const id = parseInt(req.params.id, 10);
        const side = 'sell';
        Promise.resolve(trade.putOrder(id, c1, c2, quantity, rate, side)).then((results) => {
            res.send(results);
        }).catch((error) => {
            res.send(error);
        });
    });

    app.route('/api/user/trade/buy/:id/:c1/:c2/:quantity/:rate').get((req, res) => {
        const c1 = req.params.c1;
        const c2 = req.params.c2;
        const quantity = parseFloat(req.params.quantity);
        const rate = parseFloat(req.params.rate);
        const id = parseInt(req.params.id, 10);
        const side = 'buy';
        Promise.resolve(trade.putOrder(id, c1, c2, quantity, rate, side)).then((results) => {
            res.send(results);
        }).catch((error) => {
            res.send(error);
        });
    });


    app.route('/api/user/trade_mock/sell/:id/:c1/:c2/:quantity/:rate').get((req, res) => {
        const c1 = req.params.c1;
        const c2 = req.params.c2;
        const quantity = parseFloat(req.params.quantity);
        const rate = parseFloat(req.params.rate);
        const id = parseInt(req.params.id, 10);
        const side = 'ASK';
        Promise.resolve(trade_mock.putOrder(id, c1, c2, quantity, rate, side)).then((results) => {
            res.send(results);
        }).catch((error) => {
            res.send(error);
        });
    });

    app.route('/api/user/trade_mock/buy/:id/:c1/:c2/:quantity/:rate').get((req, res) => {
        const c1 = req.params.c1;
        const c2 = req.params.c2;
        const quantity = parseFloat(req.params.quantity);
        const rate = parseFloat(req.params.rate);
        const id = parseInt(req.params.id, 10);
        const side = 'BID';
        Promise.resolve(trade_mock.putOrder(id, c1, c2, quantity, rate, side)).then((results) => {
            res.send(results);
        }).catch((error) => {
            res.send(error);
        });
    });
}