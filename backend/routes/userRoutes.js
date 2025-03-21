const express = require("express");
const { registerUser, getUsers } = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.get("/", getUsers);

module.exports = router;
