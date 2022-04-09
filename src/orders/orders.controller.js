const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

/* *********** MIDDLEWARE *********** *
 * ********************************** */

// CHECK DATA SENT BY CLIENT HAS REQUIRED PROPERTIES
const bodyDataHas = (req, res, next) => {

}

// VALIDATION FOR EACH PROPERTY AS OUTLINE IN REQUIREMENTS


/* ******** ROUTE HANDLERS ********** *
 * ********************************** */

// REFACTOR TO WORK WITH '/orders/:orderId' ROUTES
const list = (req, res) => {

}

const create = (req, res) => {

}


// REFACTOR TO WORK WITH '/orders/:orderId' ROUTES
const update = (req, res) => {

}

module.exports = {

}