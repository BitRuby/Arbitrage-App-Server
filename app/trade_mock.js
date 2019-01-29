const rp = require('request-promise');

const mockExchange1Trade = function(c1, c2, quantity, rate, side) {
    const obj = {};
    obj.method = 'POST';
    obj.json = true;
    obj.body = {
        "marketName": c1+"/"+c2,
        "price": rate,
        "quantity": quantity,
        "type": side
    }
    obj.uri = `http://localhost:5000/trade`;
    return obj;
}

const mockExchange2Trade = function(c1, c2, quantity, rate, side) {
    const obj = {};
    obj.method = 'POST';
    obj.json = true;
    obj.uri = `http://localhost:5002/trade`;
    obj.body = {
        "marketName": c1+"/"+c2,
        "price": rate,
        "quantity": quantity,
        "type": side
    }
    return obj;
}

const mockExchange3Trade = function(c1, c2, quantity, rate, side) {
    const obj = {};
    obj.method = 'POST';
    obj.json = true;
    obj.uri = `http://localhost:5003/trade`;
    obj.body = {
        "marketName": c1+"/"+c2,
        "price": rate,
        "quantity": quantity,
        "type": side
    }
    return obj;
}

const mockExchange4Trade = function(c1, c2, quantity, rate, side) {
    const obj = {};
    obj.method = 'POST';
    obj.json = true;
    obj.uri = `http://localhost:5004/trade`;
    obj.body = {
        "marketName": c1+"/"+c2,
        "price": rate,
        "quantity": quantity,
        "type": side
    }
    return obj;
}




exports.putOrder = function (id, c1, c2, quantity, rate, side) {
    let promise;
    switch (id) {
        case 1:
            promise = rp(mockExchange1Trade(c1, c2, quantity, rate, side));
            break;
        case 2:
            promise = rp(mockExchange2Trade(c1, c2, quantity, rate, side));
            break;
        case 3:
            promise = rp(mockExchange3Trade(c1, c2, quantity, rate, side));
            break;
        case 4:
            promise = rp(mockExchange4Trade(c1, c2, quantity, rate, side));
            break;
    }
    return promise;
}