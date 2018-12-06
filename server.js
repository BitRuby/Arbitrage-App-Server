const express = require('express');
const Request = require('request');
const orderBook = require('./app/order-book.js');
const summary = require('./app/summary.js');
const exchange = require('./app/exchange.js');
Request.defaults({
    headers: {'User-Agent': 'ua'}
});

const app = express();

app.listen(8000, () => {
    console.log('Server started on localhost:8000');
});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
orderBook.init(app);
summary.init(app);
exchange.init(app);