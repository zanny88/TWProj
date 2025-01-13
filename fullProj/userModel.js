const mongoose = require("mongoose");
const { messageSchema } = require('./messageModel');
require('dotenv').config();
const mongoDBUri = process.env.MONGODB_URI;

mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    passw: String,
    passw_chiara: String,
    name: String,
    mail: String,
    friends: { type: [String], default: [] },
    inbox: {type: [messageSchema], default: []}
});

const User = mongoose.model("User", userSchema);

module.exports = User;
