const { Op, DataTypes } = require("sequelize");
const db = require("../db");
const Message = require("./message");

const Conversation = db.define("conversation", {
    user1LastAccess:{
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: Date.now()
    },
    user2LastAccess:{
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: Date.now()
    }
});

// find conversation given two user Ids

Conversation.findConversation = async function (user1Id, user2Id) {
  const conversation = await Conversation.findOne({
    where: {
      user1Id: {
        [Op.or]: [user1Id, user2Id]
      },
      user2Id: {
        [Op.or]: [user1Id, user2Id]
      }
    }
  });

  // return conversation or null if it doesn't exist
  return conversation;
};

//check to make sure user is in the convo before updating
Conversation.isUserInConversation = async function (userId, convoId) {
    const conversation = await Conversation.findOne({
      where: {
          [Op.and]:[{
            id: convoId
          },{[Op.or]:[
              {user1Id: userId},
              {user2Id: userId}
          ]}
        ]
      }
    });
    // return conversation or null if it doesn't exist
    return conversation;
  };

module.exports = Conversation;