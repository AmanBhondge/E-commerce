const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phoneNumber: {type: String, required: true},
    dateOfBirth: {type : String, default: ''},
    gender: {type : String, default: ''},
    profileImg: {type : String, default: ''},
    address: {type : String, default: ''},
    city: {type : String, default: ''},
    state: {type : String, default: ''},
    country: {type : String, default: ''},
    pincode: {type : String, default: ''}
    
});

module.exports = mongoose.model('User', userSchema);