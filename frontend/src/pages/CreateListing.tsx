import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Grid,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { listings } from '../services/api';
import { ListingStatus } from '../types';
import Layout from '../components/Layout';

interface FormData {
  title: string;
  description: string;
  price: number;
  category: string;
  images: File[];
}

interface ValidationErrors {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  images?: string;
}

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    images: [],
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    const errors: ValidationErrors = {};
    if (!formData.title) {
      errors.title = 'Title is required';
    }
    if (!formData.description) {
      errors.description = 'Description is required';
    }
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    if (formData.images.length === 0) {
      errors.images = 'At least one image is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));

      // Create preview URLs
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', ListingStatus.ACTIVE);
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await listings.create(formDataToSend);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography component="h1" variant="h5" gutterBottom>
              Create New Listing
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="title"
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={!!validationErrors.title}
                    helperText={validationErrors.title}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    id="description"
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={!!validationErrors.description}
                    helperText={validationErrors.description}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    id="price"
                    label="Price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    error={!!validationErrors.price}
                    helperText={validationErrors.price}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="category"
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    error={!!validationErrors.category}
                    helperText={validationErrors.category}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Upload Images
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  {validationErrors.images && (
                    <Typography color="error" variant="caption">
                      {validationErrors.images}
                    </Typography>
                  )}
                  <Grid container spacing={2}>
                    {previewUrls.map((url, index) => (
                      <Grid item key={index} xs={12} sm={6} md={4}>
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: '100%',
                          }}
                        >
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            }}
                            onClick={() => handleRemoveImage(index)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Creating Listing...' : 'Create Listing'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};

export default CreateListing;