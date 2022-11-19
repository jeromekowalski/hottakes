const mongoose = require('mongoose');

const saucesSchema = mongoose.Schema({
    name: { type: String, require: true},
    manufacturer: { type: String, require: true},
    userId: {type: String, require:true},
    mainPepper: { type: String, require: true},
    imageUrl: { type: String, require: true},
    heat: { type: Number, require: true},
    likes: { type: Number, require: false, default:0},
    dislikes: { type: Number, require: false, default:0},
    description: { type: String, require: true},
    usersLiked: { type: Array, required: false },
    usersDisliked: { type: Array, required: false }
});

module.exports = mongoose.model('Sauces', saucesSchema);