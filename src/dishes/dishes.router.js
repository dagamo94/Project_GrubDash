const router = require("express").Router(); // use 'mergeParams: true' if the router is imported to orders.router to extend '/orders/:orderId' routes
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
// TODO: Implement the /dishes routes needed to make the tests pass

// router for '/' (GET(list), POST, ALL)
router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

// router for '/:dishId' (GET(read), PUT, ALL)
router
.route("/:dishId")
.get(controller.read)
.put(controller.update)
.all(methodNotAllowed);

module.exports = router;
