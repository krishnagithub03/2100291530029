const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 8000;

app.use(express.json());

const ecomAPIs = [
  'http://20.244.56.144/products/companies/AMZ/categories/Laptop/products?top=10&minPrice=1&maxPrice=10000'
];


const fetchProducts = async (category) => {
  const requests = ecomAPIs.map(api => axios.get(`${api}?category=${category}`));
  const responses = await Promise.all(requests);
  return responses.flatMap(response => response.data.products);
};

const sortProducts = (products, sortBy, sortOrder) => {
  return products.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy] - b[sortBy];
    } else {
      return b[sortBy] - a[sortBy];
    }
  });
};


app.get('/categories/:categoryname/products', async (req, res) => {
  const { categoryname } = req.params;
  const { n = 10, page = 1, sortBy, sortOrder = 'asc' } = req.query;

  try {
    let products = await fetchProducts(categoryname);

    products = products.map(product => ({
      ...product,
      id: uuidv4()
    }));

    if (sortBy) {
      products = sortProducts(products, sortBy, sortOrder);
    }

    
    const startIndex = (page - 1) * n;
    const paginatedProducts = products.slice(startIndex, startIndex + n);

    res.json({
      products: paginatedProducts,
      total: products.length,
      page: parseInt(page),
      pageSize: parseInt(n)
    });
  } catch (error) {
    res.status(500).json({ error: 'Fail' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
