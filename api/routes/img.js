const express = require('express');
const mongoose = require('mongoose');
const Img = require('../model/img'); 

const router = express.Router();

router.post('/upload', async (req, res) => {
    try {
        const { title, url } = req.body;

        if (!title || !url) {
            return res.status(400).json({ message: "Title and URL are required." });
        }

        const newImg = new Img({
            _id: new mongoose.Types.ObjectId(),
            title,
            url
        });

        const savedImg = await newImg.save();
        res.status(201).json({ message: "Image uploaded successfully", image: savedImg });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ GET: Fetch all images
router.get('/images', async (req, res) => {
    try {
        const images = await Img.find();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ GET: Fetch a single image by ID
router.get('/images/:id', async (req, res) => {
    try {
        const image = await Img.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }
        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
