import React, { useEffect, useState, useMemo } from 'react';
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

const Chat = ({ conversation, setActiveChat, activeConversation, user}) => {
    const [newMessageCount, setNewMessageCount] = useState(null)
    const [lastConvoLength, setLastConvoLength] = useState(null)
    const classes = useStyles();
    const { otherUser } = conversation;

    //make non async seems to remove an extra render cycle on chat onclick
    const handleClick = async (conversation) => {
        await setActiveChat(conversation.otherUser.username);
    };

    if(lastConvoLength === null){ setLastConvoLength(conversation.messages.length)}

    //new message logic center for non-fetched messages
    useEffect(() =>{
        console.log(newMessageCount, "newmsg count")

        if(conversation.otherUser.username !== activeConversation){
            console.log(conversation.otherUser.username,  activeConversation, "active convo")
            if(newMessageCount === null){ 
                setNewMessageCount(conversation.newMessageCount)
             }else if(conversation.messages.length > lastConvoLength && user.id !== conversation.messages[conversation.messages.length - 1].senderId){
                console.log(conversation.messages.length, lastConvoLength , "new message +1")
                setLastConvoLength(conversation.messages.length)
                setNewMessageCount((prev) =>{ return prev + 1})
             }
        }else{
            console.log(conversation.otherUser.username,  activeConversation, "active convo")
            setLastConvoLength(conversation.messages.length)
            setNewMessageCount(0)
        }
        // conversation.otherUser.username !== activeConversation ? 
        // (newMessageCount !== null ? setNewMessageCount((prev) => prev++) : setNewMessageCount(conversation.newMessageCount)) : 
        // setNewMessageCount(0);
    }, [conversation, activeConversation, user.id])

    console.log(conversation, "Chat.js conversation")
    console.log(newMessageCount, "newmsg count 2")


    return (
        <Box onClick={() => handleClick(conversation)} className={classes.root}>
            <BadgeAvatar
                photoUrl={otherUser.photoUrl}
                username={otherUser.username}
                online={otherUser.online}
                sidebar={true}
            />
            <ChatContent conversation={conversation} />
            {newMessageCount > 0 && <NewMessage newCount={newMessageCount} />}
        </Box>
    );
};

export default Chat;
