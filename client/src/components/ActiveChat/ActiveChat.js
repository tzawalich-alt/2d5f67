import React, { useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import { Input, Header, Messages } from './index';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexGrow: 8,
    flexDirection: 'column',
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
}));

const ActiveChat = ({
  user,
  conversations,
  activeConversation,
  postMessage,
  updateConvoAccess,
  updateReadMessage
}) => {
  const classes = useStyles();


  const conversation = useMemo(() => conversations
    ? conversations.find(
      (conversation) => conversation.otherUser.username === activeConversation
    )
    : {}
    , [activeConversation, conversations])

  const isConversation = (obj) => {
    return obj !== {} && obj !== undefined;
  };

  //sets most recent access marker when loading an active chat
  useEffect(() => {
    if (conversation && conversation !== {}) {
      updateConvoAccess(conversation);
    }
  }, [conversation, updateConvoAccess])


  return (
    <Box className={classes.root}>
      {isConversation(conversation) && conversation.otherUser && (
        <>
          <Header
            username={conversation.otherUser.username}
            online={conversation.otherUser.online || false}
          />
          <Box className={classes.chatContainer}>
            {user && (
              <>
                <Messages
                  messages={conversation.messages}
                  otherUser={conversation.otherUser}
                  userId={user.id}
                  otherUserLastSeenMessageId={conversation.otherUserLastSeenMessageId}
                  updateReadMessage={updateReadMessage}
                  convoId={conversation.id}
                />
                <Input
                  otherUser={conversation.otherUser}
                  conversationId={conversation.id || null}
                  user={user}
                  postMessage={postMessage}
                />
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ActiveChat;
