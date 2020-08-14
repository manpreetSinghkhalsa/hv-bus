module.exports = app => {
  const ticketController = require("../controllers/ticket.controller.js");
  const statusController = require("../controllers/status.controller");

  let router = require("express").Router();

  router.post("/", ticketController.create);
  router.get("/:seatNumber", ticketController.findOne);
  router.get("/:seatNumber/passenger", ticketController.findPassenger);
  router.post("/admin/reset-tickets", ticketController.resetAllTickets);

  app.use("/api", router);

  let statusRouter = require("express").Router();
  statusRouter.get("/status", statusController.statusCheck);
  app.use("", statusRouter);

};
