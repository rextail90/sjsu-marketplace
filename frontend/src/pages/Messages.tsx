import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { messages } from '../services/api';
import Layout from '../components/Layout';
import { Message, User } from '../types';

interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

const Messages: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messages.getConversations();
      setConversations(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await messages.getConversation(userId);
      setMessageList(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const message = await messages.send({
        receiverId: selectedConversation.user.id,
        content: newMessage,
      });
      setMessageList((prev) => [...prev, message]);
      setNewMessage('');
      fetchConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (loading && !selectedConversation) {
    return (
      <Layout>
        <Container>
          <Typography>Loading conversations...</Typography>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container>
          <Typography color="error">{error}</Typography>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
          {/* Conversations List */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ height: '100%', overflow: 'auto' }}>
              <List>
                {conversations.map((conversation) => (
                  <React.Fragment key={conversation.user.id}>
                    <ListItem
                      button
                      selected={selectedConversation?.user.id === conversation.user.id}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <ListItemAvatar>
                        <Avatar src={conversation.user.profileImage}>
                          {conversation.user.name[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={conversation.user.name}
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {conversation.lastMessage.content}
                          </Typography>
                        }
                      />
                      {conversation.unreadCount > 0 && (
                        <Box
                          sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                          }}
                        >
                          {conversation.unreadCount}
                        </Box>
                      )}
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Chat Interface */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {selectedConversation ? (
                <>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6">
                      {selectedConversation.user.name}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      overflow: 'auto',
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {messageList.map((message) => (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent:
                            message.sender.id === user?.id
                              ? 'flex-end'
                              : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            backgroundColor:
                              message.sender.id === user?.id
                                ? 'primary.main'
                                : 'grey.200',
                            color:
                              message.sender.id === user?.id
                                ? 'white'
                                : 'text.primary',
                            borderRadius: 2,
                            p: 1.5,
                          }}
                        >
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.7,
                            }}
                          >
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
                  </Box>
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Grid container spacing={1}>
                      <Grid item xs>
                        <TextField
                          fullWidth
                          multiline
                          maxRows={4}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                        />
                      </Grid>
                      <Grid item>
                        <IconButton
                          color="primary"
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <SendIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography color="text.secondary">
                    Select a conversation to start messaging
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Messages; 