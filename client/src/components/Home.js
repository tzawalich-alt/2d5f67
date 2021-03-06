import React, { useCallback, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Grid, CssBaseline, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { SidebarContainer } from '../components/Sidebar';
import { ActiveChat } from '../components/ActiveChat';
import { SocketContext } from '../context/socket';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
}));

const Home = ({ user, logout }) => {
    const history = useHistory();

    const socket = useContext(SocketContext);

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);

    const classes = useStyles();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const addSearchedUsers = (users) => {
        const currentUsers = {};

        // make table of current users so we can lookup faster
        conversations.forEach((convo) => {
            currentUsers[convo.otherUser.id] = true;
        });

        const newState = [...conversations];
        users.forEach((user) => {
            // only create a fake convo if we don't already have a convo with this user
            if (!currentUsers[user.id]) {
                let fakeConvo = { otherUser: user, messages: [] };
                newState.push(fakeConvo);
            }
        });

        setConversations(newState);
    };

    const clearSearchedUsers = () => {
        setConversations((prev) => prev.filter((convo) => convo.id));
    };

    const saveMessage = async (body) => {
        const { data } = await axios.post('/api/messages', body);
        return data;
    };

    const sendMessage = (data, body) => {
        socket.emit('new-message', {
            message: data.message,
            recipientId: body.recipientId,
            sender: data.sender,
        });
    };

    const postMessage = async (body) => {
        try {
            const data = await saveMessage(body);
            if (!body.conversationId) {
                addNewConvo(body.recipientId, data.message);
            } else {
                addMessageToConversation(data, body);
            }

            sendMessage(data, body);
        } catch (error) {
            console.error(error);
        }
    };

    const addNewConvo = useCallback(
        (recipientId, message) => {
            setConversations((prev) =>
                prev.map((convo) => {
                    if (convo.otherUser.id === recipientId) {
                        const convoCopy = { ...convo }
                        convoCopy.messages = [...convoCopy.messages, message];
                        convoCopy.latestMessageText = message.text;
                        convoCopy.id = message.conversationId;
                        convoCopy.newMessageCount = 0;
                        convoCopy.user1LastAccess = Date.now();
                        convoCopy.otherUserLastAccess = Date.now();
                        convoCopy.otherUserLastSeenMessageId = null;
                        return convoCopy
                    } else {
                        return convo
                    }
                })
            )
        },
        [setConversations]
    );

    const addMessageToConversation = useCallback(
        (data) => {
            // if sender isn't null, that means the message needs to be put in a brand new convo
            const { message, recipientId, sender = null } = data;
            if (sender !== null) {
                const newConvo = {
                    id: message.conversationId,
                    otherUser: sender,
                    messages: [message],
                    newMessageCount: 1,
                    user2LastAccess: Date.now(),
                    otherUserLastAccess: Date.now(),
                    otherUserLastSeenMessageId : null
                };
                newConvo.latestMessageText = message.text;
                // this if statement stops new convos from being shown to everyone
                // not the best socket.io user management, but works to stop a bug during testing
                if(recipientId === user.id){ setConversations((prev) => [newConvo, ...prev]); }
            }else{
                setConversations((prev) => 
                    prev.map((convo) => {
                        if (convo.id === message.conversationId) {
                            const convoCopy = { ...convo }
                            convoCopy.messages = [...convoCopy.messages, message];
                            convoCopy.latestMessageText = message.text;
                            return convoCopy
                        } else {
                            return convo
                        }
                    })
                )
            }
        },
        [setConversations, user.id]
    );

    const updateReadMessageStatus = useCallback( (data) =>{
        const { seenId, recipient, convoId } = data;
        if (recipient.id === user.id){
            setConversations((prev) => 
                    prev.map((convo) => {
                        if (convo.id === convoId) {
                            const convoCopy = { ...convo }
                            convoCopy.otherUserLastSeenMessageId = seenId;
                            return convoCopy
                        } else {
                            return convo
                        }
                    })
                )
        }
    }, [user.id])

    const sendReadStatus = (seenId, recipient, convoId) => {
        socket.emit('read-message', {
            seenId: seenId,
            recipient: recipient,
            convoId: convoId
        });
    };

    const updateReadMessage = async (body) => {
      sendReadStatus(body.seenId, body.recipient, body.id)
    }

    const updateConvoAccess = async (body) => {
        await axios.put('/api/conversations/read', body);
      }

    const setActiveChat = (username) => {
        setActiveConversation(username);
    };

    const addOnlineUser = useCallback((id) => {
        setConversations((prev) =>
            prev.map((convo) => {
                if (convo.otherUser.id === id) {
                    const convoCopy = { ...convo };
                    convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
                    return convoCopy;
                } else {
                    return convo;
                }
            })
        );
    }, []);

    const removeOfflineUser = useCallback((id) => {
        setConversations((prev) =>
            prev.map((convo) => {
                if (convo.otherUser.id === id) {
                    const convoCopy = { ...convo };
                    convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
                    return convoCopy;
                } else {
                    return convo;
                }
            })
        );
    }, []);

    // Lifecycle

    useEffect(() => {
        // Socket init
        socket.on('add-online-user', addOnlineUser);
        socket.on('remove-offline-user', removeOfflineUser);
        socket.on('new-message', addMessageToConversation);
        socket.on('read-message', updateReadMessageStatus);

        return () => {
            // before the component is destroyed
            // unbind all event handlers used in this component
            socket.off('add-online-user', addOnlineUser);
            socket.off('remove-offline-user', removeOfflineUser);
            socket.off('new-message', addMessageToConversation);
            socket.off('read-message', updateReadMessageStatus);
        };
    }, [addMessageToConversation, addOnlineUser, removeOfflineUser, updateReadMessageStatus, socket]);

    useEffect(() => {
        // when fetching, prevent redirect
        if (user?.isFetching) return;

        if (user && user.id) {
            setIsLoggedIn(true);
        } else {
            // If we were previously logged in, redirect to login instead of register
            if (isLoggedIn) history.push('/login');
            else history.push('/register');
        }
    }, [user, history, isLoggedIn]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { data } = await axios.get('/api/conversations');
                setConversations(data);
            } catch (error) {
                console.error(error);
            }
        };
        if (!user.isFetching) {
            fetchConversations();
        }
    }, [user]);

    const handleLogout = async () => {
        if (user && user.id) {
            await logout(user.id);
        }
    };

  return (
    <>
      <Button onClick={handleLogout}>Logout</Button>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <SidebarContainer
          conversations={conversations}
          user={user}
          clearSearchedUsers={clearSearchedUsers}
          addSearchedUsers={addSearchedUsers}
          setActiveChat={setActiveChat}
          activeConversation={activeConversation}
        />
        <ActiveChat
          activeConversation={activeConversation}
          conversations={conversations}
          user={user}
          postMessage={postMessage}
          updateConvoAccess={updateConvoAccess}
          updateReadMessage={updateReadMessage}
        />
      </Grid>
    </>
  );
};

export default Home;
