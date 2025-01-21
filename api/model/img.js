const mongoose = require('mongoose');

const imgSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },  
    url: { type: String, required: true }
});

module.exports = mongoose.model('Img', imgSchema);
