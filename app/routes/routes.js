module.exports = app => {
  const ticketController = require("../controllers/ticket.controller.js");
  const statusController = require("../controllers/status.controller");

  let router = require("express").Router();
  let currentApiVersion = "/v1";
  let ticketApiPrefix = "/api" + currentApiVersion;

  // Status api
  router.get("/status", statusController.statusCheck);

  // Ticket apis
  router.get(ticketApiPrefix + "/", ticketController.getAllBasedOnQueryParams);
  router.post(ticketApiPrefix + "/book", ticketController.bookTicket);
  router.put(ticketApiPrefix + "/:seatNumber/vacant", ticketController.updateTicketStatus);

  router.get(ticketApiPrefix + "/:seatNumber", ticketController.findOne);
  router.get(ticketApiPrefix + "/:seatNumber/passenger", ticketController.findPassenger);
  router.post(ticketApiPrefix + "/admin/reset-tickets", ticketController.resetAllTickets);

  app.use("/", router);

};
