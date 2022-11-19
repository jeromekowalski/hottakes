const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces');
const path = require('path');
const dotenv = require("dotenv");
const helmet = require('helmet')

// dotenv pour améliorer la sécurité en passant par une variable
dotenv.config();

// Helmet vous aide à sécuriser vos applications Express en définissant divers en-têtes HTTP 
app.use(helmet({crossOriginResourcePolicy: false,}));

// mongoose
mongoose.connect(process.env.MONGO_DB,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});



app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;