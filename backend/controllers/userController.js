const User = require("../models/User");

// Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Users
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Check if user exists by Auth0 ID
const checkUserExistence = async (req, res) => {
    const { auth0Id } = req.params;

    try {
        const user = await User.findOne({ auth0Id });
        if (user) {
            return res.status(200).json({ exists: true, role: user.role });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};


module.exports = { registerUser, getUsers, checkUserExistence };
