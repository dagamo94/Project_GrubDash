const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
// TODO: Implement the /orders routes needed to make the tests pass

// router for '/' (GET(LIST), POST)
// router
//     .route("/")
//     .get(controller.list)
//     .post(controller.create)
//     .all(methodNotAllowed);


// router for '/' (GET(READ), PUT, DELETE)
// router
//     .route("/:dishId")
//     .get
//     .put
//     .delete
//     .all


// NEEDED???? use dishes.router to extend router to use '/order/:orderId/dishes'

module.exports = router;
