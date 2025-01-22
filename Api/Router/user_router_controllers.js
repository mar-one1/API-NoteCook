const express = require("express");
const router = express.Router();
const bookController = require('../Controllers/user_controllers');

router.all("*", bookController.handler);

module.exports = router;
