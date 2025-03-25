import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  TextField,
  Box,
  Container,
  Pagination,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchListingsStart, fetchListingsSuccess, fetchListingsFailure } from '../store/slices/listingsSlice';
import { listings } from '../services/api';
import Layout from '../components/Layout';
import { Listing } from '../types';

const ITEMS_PER_PAGE = 12;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading, error, totalElements } = useSelector((state: RootState) => state.listings);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        dispatch(fetchListingsStart());
        const response = await listings.getAll({ 
          page: page - 1, 
          pageSize: ITEMS_PER_PAGE, 
          search: searchQuery 
        });
        dispatch(fetchListingsSuccess(response));
      } catch (err) {
        dispatch(fetchListingsFailure(err instanceof Error ? err.message : 'Failed to fetch listings'));
      }
    };

    fetchListings();
  }, [dispatch, page, searchQuery]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleListingClick = (listingId: number) => {
    navigate(`/listings/${listingId}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2 
        }}>
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to SJSU Marketplace
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Buy and sell items within the SJSU community
            </Typography>
          </div>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/create-listing')}
            sx={{ 
              height: 'fit-content',
              minWidth: '150px',
              fontWeight: 'bold'
            }}
          >
            Create Listing
          </Button>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {items.map((listing: Listing) => (
              <Grid item key={listing.id} xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={typeof listing.images[0] === 'string' ? listing.images[0] : listing.images[0]?.url || '/placeholder.jpg'}
                    alt={listing.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {listing.title}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${listing.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {listing.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleListingClick(listing.id)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalElements > ITEMS_PER_PAGE && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(totalElements / ITEMS_PER_PAGE)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Home; 