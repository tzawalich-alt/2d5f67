const Conversation = require("./conversation");
const Convo_User = require("./convo_user");
const User = require("./user");
const Message = require("./message");

// associations

Conversation.belongsToMany(User, { through: "Convo_User" });
User.belongsToMany(Conversation, { through: "Convo_User"});

User.hasMany(Message);
Message.belongsTo(User);

Conversation.hasMany(Message);
Message.belongsTo(Conversation);



// User.hasMany(Conversation);
// Conversation.belongsTo(User, { as: "user1" });
// Conversation.belongsTo(User, { as: "user2" });
// Message.belongsTo(Conversation);
// Conversation.hasMany(Message);

module.exports = {
  User,
  Conversation,
  Message,
  Convo_User
};
