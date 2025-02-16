const mongoose = require("mongoose");
require('dotenv').config();
const mongoDBUri = process.env.MONGODB_URI;

mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });

const messageSchema = new mongoose.Schema({
    from: String,
    type: String,
    data: { type: Object, default: undefined },
    seen: { type: Boolean, default: false }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message, messageSchema };
