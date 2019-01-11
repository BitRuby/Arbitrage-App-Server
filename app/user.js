const account = require('./account');
const rp = require('request-promise');
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
}