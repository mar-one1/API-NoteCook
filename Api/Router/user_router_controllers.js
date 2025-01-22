const express = require("express");
const router = express.Router();
const bookController = require('../Controllers/user_controllers');

router.use(bookController.handler);

module.exports = router;
