const req = require("express/lib/request");
const path = require("path");
const { isNumber } = require("util");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");


/* *********** MIDDLEWARE *********** *
 * ********************************** */

// CHECK IF DATA SENT BY CLIENT HAS REQUIRED PROPERTIES
const bodyDataHas = (propertyName) => {
    return function (req, res, next) {
        const { data = {} } = req.body;
        res.locals.data = data;
        data[propertyName] ? next() : next({ status: 400, message: `Dish must include a ${propertyName === "price" ? propertyName + " greater than 0" : propertyName}` });
    }
}

// MAKE SURE DISH EXISTS
const dishExists = (req, res, next) => {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);

    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }

    return next({
        status: 404,
        message: `Dish with ID: ${dishId} not found.`
    })

}

// VALIDATION FOR EACH PROPERTY AS OUTLINED IN REQUIREMENTS
const priceIsValid = (req, res, next) => {
    const { data: { price } = {} } = req.body;
    if (price <= 0 || !Number.isInteger(price)) {
        return next({ status: 400, message: `price should be greater than 0.` })
    }

    return next();
}

// FOR 'PUT': MAKE SURE THE ID IS NOT BEING ALTERED YET STILL ALLOW TO UPDATE IF NO 'ID' PROPERTY IS PASSED IN/IS UNDEFINED
const checkIdIsSame = (req, res, next) => {
    const { data: { id } = {} } = req.body;
    const { dishId } = req.params;
    if (!id) { // IF NO ID IS FOUND, ALLOW TO UPDATE
        return next();
    } else if (dishId !== id) { // IF ID IS FOUND BUT DOES NOT MATCH ROUTE ID, SEND ERROR
        return next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}` });
    }
    return next(); // UPDATE
}



/* ******** ROUTE HANDLERS ********** *
 * ********************************** */

// ??? REFACTOR TO WORK WITH '/orders/:orderId' ROUTES
const list = (req, res) => {
    res.json({ data: dishes });
}

const create = (req, res) => {
    const { data: { name, description, price, image_url } } = res.locals;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

// ??? REFACTOR TO WORK WITH '/orders/:orderId' ROUTES
const update = (req, res) => {
    const { data: { name, description, price, image_url } = {} } = res.locals;
    const { dish } = res.locals;

    // dish.name = name;
    // dish.description = description;
    // dish.price = price;
    // dish.image_url = image_url;

    // alternative to code above by creating a copy in memory of the foundDish value instead of mutating the array by reference
    const temp = { ...dish, name, description, price, image_url }; // store a copy of the dish to be update in memory
    const dishToUpdateIndex = dishes.findIndex(dish => dish.id === temp.id); // find the index in the dishes array of the item to be updated
    dishes[dishToUpdateIndex] = { ...temp }; // overwrite object/item at the index found above with copy stored in memory (temp variable)
    res.status(200).json({ data: temp });
}

// ??? REFACTOR TO WORK WITH '/orders/:orderId' ROUTES
const read = (req, res) => {
    const { dish } = res.locals;
    res.status(200).json({ data: dish });
}

module.exports = {
    list,
    create: [ // add middleware validation
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        priceIsValid,
        create
    ],
    update: [ // add Middleware validation
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        priceIsValid,
        checkIdIsSame,
        update
    ],
    read: [dishExists, read]
}