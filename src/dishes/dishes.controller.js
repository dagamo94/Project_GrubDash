const req = require("express/lib/request");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

/* *********** MIDDLEWARE *********** *
 * ********************************** */

// CHECK IF DATA SENT BY CLIENT HAS REQUIRED PROPERTIES
const bodyDataHas = (propertyName) => {
    return function (req, res, next) {
        const { data = {} } = req.body;
        res.locals.data = data;
        data[propertyName] ? next() : next({ status: 400, message: `Dish must include a ${propertyName}` });
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

// VALIDATION FOR EACH PROPERTY AS OUTLINEd IN REQUIREMENTS


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
    dishes[dishToUpdateIndex] = {...temp}; // overwrite object/item at the index found above with copy stored in memory (temp variable)
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
        create
    ],
    update: [ // add Middleware validation
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        dishExists,
        update
    ], 
    read: [dishExists, read]
}