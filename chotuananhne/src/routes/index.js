const express = require("express");
const router = express.Router();
const userRouter = require("./user.route");
const authRouter = require("./auth.route");

const routes = [
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/users",
    route: userRouter,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});
module.exports = router;
