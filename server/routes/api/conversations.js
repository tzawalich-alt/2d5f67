const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id", "user1LastAccess", "user2LastAccess"],
      order: [[Message, "createdAt", "ASC"]],
      include: [
        { model: Message, order: ["createdAt", "ASC"] },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
                },
                    },
                    attributes: ["id", "username", "photoUrl"],
                    required: false,
                },
            ],
        });

        for (let i = 0; i < conversations.length; i++) {
            const convo = conversations[i];
            const convoJSON = convo.toJSON();

            // set a property "otherUser" so that frontend will have easier access
            // for notification count, set correct user last access (delete same user as otherUser i.e. keep the person logged in)
            if (convoJSON.user1) {
                convoJSON.otherUser = convoJSON.user1;
                delete convoJSON.user1LastAccess
                delete convoJSON.user1;
            } else if (convoJSON.user2) {
                convoJSON.otherUser = convoJSON.user2;
                delete convoJSON.user2LastAccess;
                delete convoJSON.user2;
            }

            // set property for online status of the other user
            if (onlineUsers.includes(convoJSON.otherUser.id)) {
                convoJSON.otherUser.online = true;
            } else {
                convoJSON.otherUser.online = false;
            }

            // set properties for notification count
            //count all new messages sent by other user that are newer than last login.

            convoJSON.newMessageCount = convoJSON.messages.filter(message => (
                    message.senderId === convoJSON.otherUser.id
                    &&
                    (Date.parse(message.createdAt) > (+convoJSON.user1LastAccess || +convoJSON.user2LastAccess))
                )).length;
            
            //latest message preview
            convoJSON.latestMessageText = convoJSON.messages[convoJSON.messages.length - 1].text;
            conversations[i] = convoJSON;
        }

        res.json(conversations);
    } catch (error) {
        next(error);
    }
});

//checks which userAccess to update, updates it, and returns conversation
router.put("/read", async (req, res, next) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const userId = req.user.id;
        const otherUserId = req.body.otherUser.id
        const nowTime = Date.now()

        //check to make sure user is in the convo before updating
        const isUserInConvo = await Conversation.isUserInConversation(
            req.user.id, req.body.id
        );
        
        if(!isUserInConvo){
            return res.sendStatus(403)
        }


        if (req.body.user1LastAccess) {
            const conversation = await Conversation.update(
                { user1LastAccess: nowTime },
                {
                    where:{
                        user1Id: {[Op.or]: [userId, otherUserId]},
                        user2Id: { [Op.or]: [otherUserId, userId]}
                    }
                }
            );
            res.json({conversation, nowTime});
        } else {
            const conversation = await Conversation.update(
                { user2LastAccess: nowTime },
                {
                    where:{
                        user1Id: {[Op.or]: [userId, otherUserId]},
                        user2Id: { [Op.or]: [otherUserId, userId]}
                    }
                }
            );
            res.json({conversation, nowTime});
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
