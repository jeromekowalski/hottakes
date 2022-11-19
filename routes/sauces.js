const express = require('express');
const router = express.Router();
const Sauce = require('../models/Sauces');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const saucesCtrl = require('../controllers/sauces');

//Routes  
router.post('/', auth, multer, saucesCtrl.createSauce);
router.put('/:id', auth, multer, saucesCtrl.modifySauces);
router.delete('/:id', auth, saucesCtrl.deleteSauce); 
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.get('/' + '', auth, saucesCtrl.getAllSauces);
router.post('/:id/like', auth, saucesCtrl.likeSauce);
module.exports = router;