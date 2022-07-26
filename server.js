require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/api/service', require('./routes/serviceRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/order', require('./routes/orderRoutes'));

if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// app.use(express.static('client/build'));

// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
