require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../model/user');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');



const CounterSchema = mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', CounterSchema);

async function generateUniqueId() {
    const counter = await Counter.findOneAndUpdate(
        { _id: 'userId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return `WI${counter.seq}`;
}

router.get('/all', async (req, res) => {
    try {
        const users = await User.find({}, '-password');  
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



router.post('/signup', async (req, res, next) => {
    try {
        
        const existingUser  = await User.findOne({ email: req.body.email });

        if (existingUser ) {
            return res.status(409).json({
                message: 'Email not available'
            });
        }

        const hash = await bcrypt.hash(req.body.password, 10);
        const uniqueId = await generateUniqueId();

        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            userId: uniqueId,
            password: hash,
            email: req.body.email
        });

        const result = await user.save();
        res.status(200).json({
            new_user: result
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.post('/login', async (req, res, next) => {
    try {
     
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(401).json({
                message: 'User does not exist'
            });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid password'
            });
        }

        const token = jwt.sign(
            { email: user.email, userId: user.userId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            email: user.email,
            userId:user.userId,
            token: token
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});



module.exports = router;