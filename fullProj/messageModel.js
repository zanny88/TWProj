// meesageModel.js
const mongoose = require("mongoose");
require('dotenv').config();
const mongoDBUri = process.env.MONGODB_URI;

const mongoDBUri = "mongodb+srv://marcostignani9:qpalzmQP8@clusternote.yd03buh.mongodb.net/?retryWrites=true&w=majority&appName=ClusterNote";
//const mongoDBUri = "mongodb+srv://giarrussolorenzo:t1otEqlgBECuv4NL@cluster0.hqzaedi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//const mongoDBUri = "mongodb://site232415:eib8PaiP@mongo_site232415/?authSource=admin&writeConcern=majority";
mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });

const messageSchema = new mongoose.Schema({
    from: String,
    type: String,
    data: {type: String, default: ""},
    seen: {type: Boolean, default: false}
});

const Message = mongoose.model("Message", messageSchema);

module.exports = {Message,messageSchema};
