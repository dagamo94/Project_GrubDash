const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

/* *********** MIDDLEWARE *********** *
 * ********************************** */

//MAKE SURE ORDER EXISTS BEFORE RETRIEVING OR PERFORMING ANY UPDATES TO IT
const orderExists = (req, res, next) => {
    const {orderId} = req.params;
    const foundOrder = orders.find(order => order.id === orderId);

    if(foundOrder){
        res.locals.order = foundOrder;
        return next();
    }

    return next({status: 404, message: `Dish with ID: ${orderId} not found.`});
}

// CHECK DATA SENT BY CLIENT HAS REQUIRED PROPERTIES
const bodyDataHas = (propertyName) => {
    return function (req, res, next) {
        const { data = {} } = req.body;
        res.locals.data = data;
        data[propertyName] ? next() : next({ status: 400, message: `Order must include a ${propertyName === "dishes" ? propertyName + " array property with at least one dish" : propertyName}` })
    }
}


// VALIDATION FOR EACH PROPERTY AS OUTLINED IN REQUIREMENTS
// FOR 'POST' AND 'PUT'
const dishQuantityIsValid = (req, res, next) => {
    const { data: { dishes } = {} } = res.locals;
    let index = 0;
    if (dishes.length) {
        for (const dish of dishes) {
            const { quantity } = dish;
            if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
                return next({ status: 400, message: `dish ${index} must have a quantity that is an integer greater than 0` });
            }
            index++;
        }
        return next();
    }
    return next({ status: 400, message: `Order must include at least one dish` });
}

// FOR 'DELETE/DESTROY': CHECK IF AN EXISTING ORDER'S STATUS IS PENDING
const checkStatusPending = (req, res, next) => {
    const {order} = res.locals
    order.status === "pending" ? next() : next({status: 400, message: `An order cannot be deleted unless it is pending`});
}

// FOR 'PUT': CHECK IF AN EXISTING ORDER'S STATUS IS NOT DELIVERED
const statusNotDelivered = (req, res, next) => {
    const {order} = res.locals
    order.status === "delivered" ? next({status: 400, message: `A delivered order cannot be changed.`}) : next();
}

// FOR 'PUT': MAKE SURE STATUS BEING PASSED IN HAS A VALID STATUS CODE
const statusIsValid = (req, res, next) => {
    const {data: {status}} = res.locals;
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];

    validStatus.includes(status) ? next() : next({status: 400, message: `Order must have a status of ${validStatus.join(", ")}`})
}

// FOR 'PUT': MAKE SURE THE ID IS NOT BEING ALTERED YET STILL ALLOW TO UPDATE IF NO 'ID' PROPERTY IS PASSED IN/IS UNDEFINED
const checkIdIsSame = (req, res, next) => {
    const {data: {id} ={}} = req.body;
    const {orderId} = req.params;
    
    if(!id){
        return next();
    }else if(id !== orderId){
        return next({status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`});
    }
    return next();
}

/* ******** ROUTE HANDLERS ********** *
 * ********************************** */

const list = (req, res) => {
    res.status(200).json({ data: orders });
}

const create = (req, res) => {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = res.locals;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    }

    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

// MAKE SURE TO ADD VALIDATION MIDDLEWARE SO THAT IF NO ID IS PASSED IN, ORDER IS STILL UPDATE, AND IF ID DOES NOT MATCH CURRENT ORDER'S BEING UPDATED ID, IT WILL NOT UPDATE
const update = (req, res) => {
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = res.locals;
    const {order} = res.locals;

    // ??? REFACTOR TO SIMILAR METHOD AS IN 'dishes.controller'
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.status(200).json({data: order});
}

const read = (req, res) => {
    const {order} = res.locals;
    res.status(200).json({data: order});
}

// ADD VALIDATION MIDDLEWARE TO MAKE SURE AN ORDER'S STATUS IS NOT PENDING
const  destroy = (req, res) => {
    const {orderId} = req.params;
    const deleteIndex = orders.findIndex(order => order.id === orderId);
    orders.splice(deleteIndex, 1);
    res.sendStatus(204);
}

module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        //bodyDataHas("status"),
        bodyDataHas("dishes"),
        dishQuantityIsValid,
        create
    ],
    update: [
        orderExists,
        checkIdIsSame,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("status"),
        bodyDataHas("dishes"),
        dishQuantityIsValid,
        statusIsValid,
        statusNotDelivered,
        update
    ],
    read: [orderExists, read],
    delete: [orderExists, checkStatusPending, destroy]
}