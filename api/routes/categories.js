const express = require('express');
const router = express.Router();
const Category = require('../model/category');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categoryList = await Category.find();
        res.status(200).json({ success: true, categories: categoryList });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch categories", error });
    }
});

// Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        res.status(200).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Invalid Category ID', error });
    }
});

// Create new category
router.post('/', async (req, res) => {
    try {
        const existingCategory = await Category.findOne({ title: req.body.title });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: 'Category already exists!' });
        }

        let category = new Category({ title: req.body.title });
        category = await category.save();

        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create category', error });
    }
});

// Update category by ID
router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { title: req.body.title },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found!' });
        }

        res.status(200).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update category', error });
    }
});

// Delete category by ID
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found!" });
        }
        res.status(200).json({ success: true, message: "Category deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete category", error });
    }
});

module.exports = router;
