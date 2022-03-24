import React from 'react';
import { Box } from '@material-ui/core';
import { BadgeAvatar, ChatContent, NewMessage } from '../Sidebar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: 8,
        height: 80,
        boxShadow: '0 2px 10px 0 rgba(88,133,196,0.05)',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
            cursor: 'grab',
        },
    },
}));

const Chat = ({ conversation, setActiveChat }) => {
    const classes = useStyles();
    const { otherUser } = conversation;

    //counts new messages by checking if the message createdAt timestamp is newer than the last visit to the conversation
    const newCount = conversation.messages.filter(message =>
    (
        message.senderId === conversation.otherUser.id
        &&
        (Date.parse(message.createdAt) > (+conversation.user1LastAccess || +conversation.user2LastAccess))
    )).length;

    const handleClick = async (conversation) => {
        await setActiveChat(conversation.otherUser.username);
    };

    console.log(conversation, "Chat.js conversation")

    return (
        <Box onClick={() => handleClick(conversation)} className={classes.root}>
            <BadgeAvatar
                photoUrl={otherUser.photoUrl}
                username={otherUser.username}
                online={otherUser.online}
                sidebar={true}
            />
            <ChatContent conversation={conversation} />
            {newCount > 0 && <NewMessage newCount={newCount} />}
        </Box>
    );
};

export default Chat;
