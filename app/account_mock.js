const rp = require('request-promise');

const getMockExchange1UserBalances = function() {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    obj.uri = `http://localhost:5000/account/balances`;
    return obj;
}

const getMockExchange2UserBalances = function() {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    obj.uri = `http://localhost:5002/account/balances`;
    return obj;
}

const getMockExchange3UserBalances = function() {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    obj.uri = `http://localhost:5003/account/balances`;
    return obj;
}

const getMockExchange4UserBalances = function() {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    obj.uri = `http://localhost:5004/account/balances`;
    return obj;
}

const getMockExchange1UserOrders = function() {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    obj.uri = `http://localhost:5000/account/orders`;
    return obj;
}

const getMockExchange2UserOrders = function() {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    obj.uri = `http://localhost:5002/account/orders`;
    return obj
}

const getMockExchange3UserOrders = function() {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    obj.uri = `http://localhost:5003/account/orders`;
    return obj
}

const getMockExchange4UserOrders = function() {
    const obj = {};
    obj.method = 'GET';
    obj.json = true;
    obj.uri = `http://localhost:5004/account/orders`;
    return obj
}


exports.getRequestedUserBalance = function (id) {
    let promise;
    switch (id) {
        case 1:
            promise = rp(getMockExchange1UserBalances());
            break;
        case 2:
            promise = rp(getMockExchange2UserBalances());
            break;
        case 3:
            promise = rp(getMockExchange3UserBalances());
            break;
        case 4:
            promise = rp(getMockExchange4UserBalances());
            break;
    }
    return promise;
}

exports.getRequestedUserOrders = function (id) {
    let promise;
    switch (id) {
        case 1:
            promise = rp(getMockExchange1UserOrders());
            break;
        case 2:
            promise = rp(getMockExchange2UserOrders());
            break;
        case 3:
            promise = rp(getMockExchange3UserOrders());
            break;
        case 4:
            promise = rp(getMockExchange4UserOrders());
            break;
    }
    return promise;
}