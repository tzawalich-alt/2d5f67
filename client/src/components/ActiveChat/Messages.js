import React, { useEffect } from 'react';
import { Avatar, Box, makeStyles } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '.';
import moment from 'moment';

const useStyles = makeStyles(() => ({
  seenAvatarHolder: {
    width: "100%",
    display: "flex",
    alignItems: "flex-end",
    flexDirection: "column"
  },
  avatar: {
    height: 24,
    width: 24,
    marginTop: 6,
  }

}));

const Messages = (props) => {
  const { messages, otherUser, userId, convoId, updateReadMessage, otherUserLastSeenMessageId } = props;
  const classes = useStyles();

  useEffect(() => {
    const theirMessages = messages.filter(message => message.senderId === otherUser.id);
    let lastSeenMessageId;
    theirMessages.length === 0 ?
      lastSeenMessageId = null :
      lastSeenMessageId = theirMessages[theirMessages.length - 1].id

    updateReadMessage({ seenId: lastSeenMessageId, recipient: otherUser, id: convoId })

  }, [messages, userId, convoId, otherUser])

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format('h:mm');

        return message.senderId === userId ? (
          //Fragment in a list REALLY wanted a key even though they don't show in DOM
          <React.Fragment key={"fragment"+message.id}>
            <SenderBubble key={message.id} text={message.text} time={time} />
            {
              otherUserLastSeenMessageId === message.id &&
              <div key={"seenMessageAvatar"} className={classes.seenAvatarHolder}>
                <Avatar alt={otherUser.username} src={otherUser.photoUrl} className={classes.avatar} />
              </div>
            }
          </React.Fragment>
        ) : (
          <OtherUserBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
