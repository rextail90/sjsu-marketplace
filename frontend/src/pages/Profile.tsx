import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { listings } from '../services/api';
import Layout from '../components/Layout';
import { Listing } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [soldListings, setSoldListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listings.getUserListings();
      setActiveListings(response.filter((listing) => listing.status === 'ACTIVE'));
      setSoldListings(response.filter((listing) => listing.status === 'SOLD'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditClick = (listing: Listing) => {
    setSelectedListing(listing);
    setEditForm({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (listing: Listing) => {
    setSelectedListing(listing);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedListing) return;

    try {
      await listings.update(selectedListing.id, editForm);
      setEditDialogOpen(false);
      fetchListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    }
  };

  const handleDelete = async () => {
    if (!selectedListing) return;

    try {
      await listings.delete(selectedListing.id);
      setDeleteDialogOpen(false);
      fetchListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <Typography>Loading profile...</Typography>
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
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={user?.profileImage}
                  sx={{ width: 100, height: 100, mr: 3 }}
                >
                  {user?.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {user?.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Listings Tabs */}
          <Grid item xs={12}>
            <Paper elevation={3}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Active Listings" />
                <Tab label="Sold Listings" />
              </Tabs>
              <TabPanel value={tabValue} index={0}>
                <List>
                  {activeListings.map((listing) => (
                    <React.Fragment key={listing.id}>
                      <ListItem>
                        <ListItemText
                          primary={listing.title}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                ${listing.price}
                              </Typography>
                              {' — '}
                              {listing.description}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => handleEditClick(listing)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteClick(listing)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <List>
                  {soldListings.map((listing) => (
                    <React.Fragment key={listing.id}>
                      <ListItem>
                        <ListItemText
                          primary={listing.title}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                ${listing.price}
                              </Typography>
                              {' — '}
                              {listing.description}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              value={editForm.price}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  price: parseFloat(e.target.value),
                }))
              }
            />
            <TextField
              margin="dense"
              label="Category"
              fullWidth
              value={editForm.category}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, category: e.target.value }))
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Listing</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this listing? This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Profile; 