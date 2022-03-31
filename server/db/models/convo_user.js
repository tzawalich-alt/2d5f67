const { Op, DataTypes } = require("sequelize");
const db = require("../db");
const Message = require("./message");

const Convo_User = db.define("convo_user", {
    userLastAccess:{
        type: DataTypes.BIGINT,
        allowNull: false
    }
});

module.exports = Convo_User;
