import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  TextField,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { listings } from '../services/api';
import { messages } from '../services/api';
import Layout from '../components/Layout';
import { Listing, Message } from '../types';

const ListingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listings.getById(Number(id));
        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listing');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImageDialog = () => {
    setSelectedImage(null);
  };

  const handleMessageClick = () => {
    setMessageDialogOpen(true);
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
    setMessageText('');
  };

  const handleSendMessage = async () => {
    if (!listing || !messageText.trim()) return;

    try {
      setSendingMessage(true);
      await messages.send({
        listingId: listing.id,
        receiverId: listing.seller.id,
        content: messageText,
      });
      handleCloseMessageDialog();
      navigate('/messages');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <Typography>Loading...</Typography>
        </Container>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout>
        <Container>
          <Typography color="error">{error || 'Listing not found'}</Typography>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Image Gallery */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '75%',
                  mb: 2,
                }}
              >
                <img
                  src={listing.images[0]?.url || '/placeholder.jpg'}
                  alt={listing.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
              <Grid container spacing={1}>
                {listing.images.map((image, index) => (
                  <Grid item key={index} xs={3}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        paddingTop: '100%',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleImageClick(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={`${listing.title} ${index + 1}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Listing Details */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                {listing.title}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                ${listing.price}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>
                {listing.description}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Category: {listing.category}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status: {listing.status}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Posted by: {listing.seller.name}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Posted on: {new Date(listing.createdAt).toLocaleDateString()}
              </Typography>
              {user && user.id !== listing.seller.id && (
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={handleMessageClick}
                >
                  Message Seller
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Image Dialog */}
        <Dialog
          open={!!selectedImage}
          onClose={handleCloseImageDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size"
                style={{ width: '100%', height: 'auto' }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={messageDialogOpen} onClose={handleCloseMessageDialog}>
          <DialogTitle>Send Message to {listing.seller.name}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Message"
              fullWidth
              multiline
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMessageDialog}>Cancel</Button>
            <Button
              onClick={handleSendMessage}
              variant="contained"
              disabled={sendingMessage || !messageText.trim()}
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default ListingDetails; 