const { Op, DataTypes } = require("sequelize");
const db = require("../db");
const Message = require("./message");

//convoName could be used to name the chatroom and create a title, if wanted
const Conversation = db.define("conversation", {
    convoName:{
        type: DataTypes.string,
        allowNull: true
    }
});

module.exports = Conversation;
