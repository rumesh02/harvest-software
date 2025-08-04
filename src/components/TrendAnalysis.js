import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Agriculture as AgricultureIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MoneyIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';

const TrendAnalysis = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quick Price Checker time period filtering
  const [quickPriceFilter, setQuickPriceFilter] = useState('all');
  const [rawProductsData, setRawProductsData] = useState([]);

  useEffect(() => {
    // Fetch all market products (no farmer filter needed)
    fetchProductPrices();
  }, []);

  // Filter products based on search term and time period
  useEffect(() => {
    let filtered = [...products];

    // Filter by search term (product name)
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply quick price filter for date range
    if (quickPriceFilter !== 'all' && rawProductsData.length > 0) {
      const now = new Date();
      let cutoffDate;
      
      switch (quickPriceFilter) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case '7days':
          cutoffDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          break;
        case '30days':
          cutoffDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          break;
        default:
          cutoffDate = null;
      }
      
      if (cutoffDate) {
        // Filter raw data by date and recalculate averages
        const filteredRawData = rawProductsData.filter(product => {
          const productDate = new Date(product.listedDate || product.createdAt || product.dateCreated || new Date());
          return productDate >= cutoffDate;
        });
        
        // Recalculate product averages with filtered data
        const productMap = {};
        
        filteredRawData.forEach(product => {
          const originalProductName = product.name || product.type || 'Unknown Product';
          const normalizedProductName = originalProductName.toLowerCase().trim();
          const price = product.price || 0;
          
          if (!productMap[normalizedProductName]) {
            productMap[normalizedProductName] = {
              name: originalProductName, // Keep the original name for display
              prices: [],
              totalQuantity: 0,
              category: product.type || 'Other',
              farmers: new Set(),
              listings: []
            };
          }
          
          productMap[normalizedProductName].prices.push(price);
          productMap[normalizedProductName].totalQuantity += product.quantity || 0;
          productMap[normalizedProductName].farmers.add(product.farmerID || 'Unknown');
          productMap[normalizedProductName].listings.push({
            price: price,
            quantity: product.quantity || 0,
            createdAt: product.listedDate || product.createdAt || product.dateCreated || new Date(),
            farmerId: product.farmerID || 'Unknown'
          });
        });
        
        const filteredProductList = Object.values(productMap)
          .filter(product => product.prices.length > 0)
          .map(product => ({
            name: product.name,
            averagePrice: product.prices.reduce((sum, price) => sum + price, 0) / product.prices.length,
            totalQuantity: product.totalQuantity,
            category: product.category,
            listings: product.prices.length,
            farmerCount: product.farmers.size,
            rawListings: product.listings,
            lastUpdated: Math.max(...product.listings.map(l => new Date(l.createdAt).getTime()))
          }));
        
        // Filter by search term if applied
        filtered = searchTerm.trim() 
          ? filteredProductList.filter(product =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : filteredProductList;
      }
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, quickPriceFilter, rawProductsData]);

  // Get unique categories for display purposes
  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories.filter(category => category && category !== '');
  };

  // Clear search and reset filters
  const clearSearch = () => {
    setSearchTerm('');
    setQuickPriceFilter('all');
  };

  // Function to calculate time since listing
  const getTimeSince = (date) => {
    const now = new Date();
    const listingDate = new Date(date);
    const diffInMs = now - listingDate;
    
    const minutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  const fetchProductPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Original simple product listing
      const response = await axios.get(`http://localhost:5000/api/products?limit=1000`);
      const productsData = response.data.products || response.data || [];
      
      // Store raw data for time-based filtering
      setRawProductsData(productsData);
      
      if (productsData && productsData.length > 0) {
        // Group products by name and calculate average price (original logic)
        const productMap = {};
        
        productsData.forEach(product => {
          const originalProductName = product.name || product.type || 'Unknown Product';
          const normalizedProductName = originalProductName.toLowerCase().trim();
          const price = product.price || 0;
          
          if (!productMap[normalizedProductName]) {
            productMap[normalizedProductName] = {
              name: originalProductName, // Keep the original name for display
              prices: [],
              totalQuantity: 0,
              category: product.type || 'Other',
              farmers: new Set(),
              listings: []
            };
          }
          
          productMap[normalizedProductName].prices.push(price);
          productMap[normalizedProductName].totalQuantity += product.quantity || 0;
          productMap[normalizedProductName].farmers.add(product.farmerID || 'Unknown');
          productMap[normalizedProductName].listings.push({
            price: price,
            quantity: product.quantity || 0,
            createdAt: product.listedDate || product.createdAt || product.dateCreated || new Date(),
            farmerId: product.farmerID || 'Unknown'
          });
        });
        
        const productList = Object.values(productMap).map(product => ({
          name: product.name,
          averagePrice: product.prices.reduce((sum, price) => sum + price, 0) / product.prices.length,
          totalQuantity: product.totalQuantity,
          category: product.category,
          listings: product.prices.length,
          farmerCount: product.farmers.size,
          rawListings: product.listings,
          lastUpdated: Math.max(...product.listings.map(l => new Date(l.createdAt).getTime()))
        }));
        
        productList.sort((a, b) => b.averagePrice - a.averagePrice);
        setProducts(productList);
      } else {
        setProducts([]);
        setRawProductsData([]);
      }
    } catch (error) {
      console.error('Error fetching product prices:', error);
      setError('Failed to load all market product prices');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column' 
      }}>
        <CircularProgress size={60} sx={{ color: '#155724', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading Product Prices...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#155724',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <MoneyIcon />
            Market Price Analyzer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Get instant price insights and historical trends to make better pricing decisions
          </Typography>
        </Box>

      {/* Quick Price Checker - Dedicated Section */}
      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
        border: '2px solid #4caf50'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <SearchIcon sx={{ color: '#2e7d32', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#155724' }}>
            Quick Price Checker
          </Typography>
        </Box>
        
        <Typography variant="body1" color="#388e3c" sx={{ mb: 3 }}>
          Search for any product to instantly see its current market price from all farmers and help you make informed pricing decisions.
        </Typography>
        
        {/* Time Period Filter for Quick Price Checker */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#2e7d32', fontWeight: 600 }}>
            📅 Price Analysis Period:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[
              { value: 'all', label: 'All Time', icon: '∞' },
              { value: 'today', label: 'Today', icon: '📅' },
              { value: '7days', label: 'Last 7 Days', icon: '📊' },
              { value: '30days', label: 'Last 30 Days', icon: '📈' }
            ].map((filter) => (
              <Chip
                key={filter.value}
                label={`${filter.icon} ${filter.label}`}
                variant={quickPriceFilter === filter.value ? 'filled' : 'outlined'}
                onClick={() => setQuickPriceFilter(filter.value)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: quickPriceFilter === filter.value ? '#4caf50' : 'transparent',
                  color: quickPriceFilter === filter.value ? 'white' : '#2e7d32',
                  borderColor: '#4caf50',
                  fontWeight: quickPriceFilter === filter.value ? 700 : 500,
                  '&:hover': {
                    backgroundColor: quickPriceFilter === filter.value ? '#388e3c' : '#e8f5e8',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            💡 Select a time period to see average prices only from listings within that range
          </Typography>
        </Box>
        
        <TextField
          fullWidth
          size="large"
          placeholder="Type product name to check current market price..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#4caf50', fontSize: 24 }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              fontSize: '1.1rem',
              '& fieldset': { borderColor: '#4caf50', borderWidth: 2 },
              '&:hover fieldset': { borderColor: '#2e7d32' },
              '&.Mui-focused fieldset': { borderColor: '#1b5e20' }
            }
          }}
        />
        
        {/* Display active filter info */}
        {quickPriceFilter !== 'all' && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: '#e3f2fd', 
            borderRadius: 2, 
            border: '1px solid #2196f3' 
          }}>
            <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>
              🔍 Currently showing prices from: {
                quickPriceFilter === 'today' ? 'Today only' :
                quickPriceFilter === '7days' ? 'Last 7 days' :
                quickPriceFilter === '30days' ? 'Last 30 days' : 'All time'
              }
            </Typography>
          </Box>
        )}
        
        {/* Instant Price Display */}
        {searchTerm && filteredProducts.length > 0 && (
          <Box sx={{ 
            mt: 3, 
            p: 3, 
            backgroundColor: 'white', 
            borderRadius: 3, 
            border: '3px solid #4caf50',
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.2)'
          }}>
            {filteredProducts.length === 1 ? (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  color: '#1b5e20', 
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Rs. {filteredProducts[0].averagePrice.toFixed(2)}
                </Typography>
                <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, fontWeight: 600 }}>
                  Current Market Price for "{filteredProducts[0].name}"
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${filteredProducts[0].listings} listings available`}
                    sx={{ backgroundColor: '#c8e6c9', color: '#155724', fontWeight: 600 }}
                  />
                  <Chip 
                    label={`${filteredProducts[0].totalQuantity} kg in market`}
                    sx={{ backgroundColor: '#c8e6c9', color: '#155724', fontWeight: 600 }}
                  />
                  <Chip 
                    label={filteredProducts[0].category}
                    sx={{ backgroundColor: '#a5d6a7', color: '#155724', fontWeight: 600 }}
                  />
                  {filteredProducts[0].lastUpdated && (
                    <Chip 
                      label={`Updated ${getTimeSince(filteredProducts[0].lastUpdated)}`}
                      sx={{ backgroundColor: '#ffecb3', color: '#e65100', fontWeight: 600 }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="#666" sx={{ mt: 2 }}>
                  💡 Price based on {quickPriceFilter === 'all' ? 'all market listings' : 
                    quickPriceFilter === 'today' ? 'today\'s listings only' :
                    quickPriceFilter === '7days' ? 'last 7 days listings' :
                    'last 30 days listings'} - Use this to set competitive prices
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" sx={{ color: '#155724', mb: 3, textAlign: 'center', fontWeight: 600 }}>
                  Found {filteredProducts.length} products matching "{searchTerm}"
                </Typography>
                <Grid container spacing={2}>
                  {filteredProducts.slice(0, 4).map((product, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Paper sx={{ 
                        p: 2, 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: 2,
                        textAlign: 'center',
                        border: '1px solid #e8f5e8'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1b5e20', mb: 1 }}>
                          Rs. {product.averagePrice.toFixed(2)}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#155724', mb: 1 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="#666">
                          {product.listings} listings
                        </Typography>
                        {product.lastUpdated && (
                          <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 600, display: 'block' }}>
                            {getTimeSince(product.lastUpdated)}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                {filteredProducts.length > 4 && (
                  <Typography variant="body2" color="#666" sx={{ mt: 2, textAlign: 'center' }}>
                    + {filteredProducts.length - 4} more results in the detailed table below
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
        
        {searchTerm && filteredProducts.length === 0 && (
          <Box sx={{ 
            mt: 3, 
            p: 3, 
            backgroundColor: '#fff3e0', 
            borderRadius: 3, 
            textAlign: 'center',
            border: '2px solid #ff9800'
          }}>
            <Typography variant="h6" color="#f57c00" sx={{ mb: 1 }}>
              No products found for "{searchTerm}"
            </Typography>
            <Typography variant="body2" color="#bf360c">
              Try searching with a different product name
            </Typography>
          </Box>
        )}
        
        {/* Quick Product Suggestions */}
        {!searchTerm && products.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="#666" sx={{ mb: 2 }}>
              💡 Popular products to check:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {products.slice(0, 8).map(product => (
                <Chip
                  key={product.name}
                  label={product.name}
                  size="small"
                  variant="outlined"
                  onClick={() => setSearchTerm(product.name)}
                  sx={{ 
                    cursor: 'pointer',
                    borderColor: '#4caf50',
                    color: '#2e7d32',
                    '&:hover': { 
                      backgroundColor: '#e8f5e8', 
                      borderColor: '#2e7d32',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
            borderRadius: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AgricultureIcon sx={{ color: '#155724', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#155724' }}>
                    {filteredProducts.length}
                  </Typography>
                  <Typography variant="body2" color="#388e3c">
                    {searchTerm ? 'Filtered Products' : 'Product Types'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
            borderRadius: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ color: '#155724', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#155724' }}>
                    {filteredProducts.length > 0 ? `Rs. ${Math.max(...filteredProducts.map(p => p.averagePrice)).toFixed(0)}` : 'Rs. 0'}
                  </Typography>
                  <Typography variant="body2" color="#388e3c">
                    Highest Price
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
            borderRadius: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MoneyIcon sx={{ color: '#155724', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#155724' }}>
                    {filteredProducts.length > 0 ? `Rs. ${(filteredProducts.reduce((sum, p) => sum + p.averagePrice, 0) / filteredProducts.length).toFixed(0)}` : 'Rs. 0'}
                  </Typography>
                  <Typography variant="body2" color="#388e3c">
                    Average Price
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Products Table */}
      <Paper sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #155724 0%, #2e7d32 100%)',
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Product Price List
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Filtered results based on your search' : 'Current market prices from all farmers'}
          </Typography>
        </Box>
        
        {filteredProducts.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            {products.length === 0 ? (
              <>
                <AgricultureIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Products Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently no products are listed in the market
                </Typography>
              </>
            ) : (
              <>
                <SearchIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Products Match Your Search
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Try adjusting your search criteria or clear search to see all products
                </Typography>
                <Chip 
                  label="Clear Search" 
                  onClick={clearSearch}
                  sx={{ 
                    backgroundColor: '#155724', 
                    color: 'white',
                    '&:hover': { backgroundColor: '#2e7d32' }
                  }}
                />
              </>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#155724' }}>Product Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#155724' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#155724' }}>Average Price</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#155724' }}>Total Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#155724' }}>Listings</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#155724' }}>Farmers</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#155724' }}>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product, index) => {
                  // Check if this product name contains the search term
                  const isHighlighted = searchTerm && product.name.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  return (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:hover': { backgroundColor: '#f9f9f9' },
                        '&:nth-of-type(even)': { backgroundColor: '#fafafa' },
                        backgroundColor: isHighlighted ? '#e8f5e8' : 'inherit',
                        border: isHighlighted ? '2px solid #4caf50' : 'none'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AgricultureIcon sx={{ 
                            color: isHighlighted ? '#2e7d32' : '#4caf50', 
                            fontSize: 20 
                          }} />
                          <Typography variant="body1" sx={{ 
                            fontWeight: isHighlighted ? 600 : 500,
                            color: isHighlighted ? '#2e7d32' : 'inherit'
                          }}>
                            {product.name}
                          </Typography>
                          {isHighlighted && (
                            <Chip 
                              label="Match"
                              size="small"
                              sx={{ 
                                backgroundColor: '#4caf50',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: 10
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.category}
                          size="small"
                          sx={{ 
                            backgroundColor: isHighlighted ? '#c8e6c9' : '#e8f5e8',
                            color: '#155724',
                            fontWeight: isHighlighted ? 600 : 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ 
                          fontWeight: isHighlighted ? 700 : 600, 
                          color: isHighlighted ? '#1b5e20' : '#2e7d32',
                          fontSize: isHighlighted ? '1.1rem' : '1rem'
                        }}>
                          Rs. {product.averagePrice.toFixed(2)}
                        </Typography>
                        {isHighlighted && (
                          <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                            Current Market Price
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          fontWeight: isHighlighted ? 600 : 400 
                        }}>
                          {product.totalQuantity} kg
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${product.listings} listings`}
                          size="small"
                          variant={isHighlighted ? "filled" : "outlined"}
                          sx={{ 
                            color: isHighlighted ? 'white' : '#666',
                            backgroundColor: isHighlighted ? '#4caf50' : 'transparent'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${product.farmerCount} farmers`}
                          size="small"
                          sx={{ 
                            backgroundColor: isHighlighted ? '#a5d6a7' : '#f5f5f5',
                            color: '#155724',
                            fontWeight: isHighlighted ? 600 : 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {product.lastUpdated ? (
                          <Box>
                            <Typography variant="body2" sx={{ 
                              fontWeight: isHighlighted ? 600 : 500,
                              color: isHighlighted ? '#e65100' : '#ff9800'
                            }}>
                              {getTimeSince(product.lastUpdated)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(product.lastUpdated).toLocaleDateString()}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Unknown
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default TrendAnalysis;
