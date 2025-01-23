const { Product } = require('../model/product');
const express = require('express');
const { Category } = require('../model/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = isValid ? null : new Error('Invalid image type');

        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

// ✅ GET all products (optional category filter)
router.get(`/`, async (req, res) => {
    try {
        let filter = {};
        if (req.query.categories) {
            filter = { category: req.query.categories.split(',') };
        }

        const productList = await Product.find(filter).populate('category');
        res.send(productList);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ GET single product by ID
router.get(`/:id`, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found!' });
        }
        res.send(product);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ CREATE a new product
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(400).send('Invalid Category');

        const file = req.file;
        if (!file) return res.status(400).send('No image in the request');

        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: `${basePath}${fileName}`,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        });

        product = await product.save();

        res.send(product);
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

// ✅ UPDATE an existing product
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id');
        }

        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).send('Product not found!');
        }

        const category = await Category.findById(req.body.category);
        if (!category) return res.status(400).send('Invalid Category');

        const file = req.file;
        let imagePath = existingProduct.image;
        if (file) {
            const fileName = file.filename;
            imagePath = `${req.protocol}://${req.get('host')}/public/uploads/${fileName}`;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name || existingProduct.name,
                description: req.body.description || existingProduct.description,
                richDescription: req.body.richDescription || existingProduct.richDescription,
                image: imagePath,
                brand: req.body.brand || existingProduct.brand,
                price: req.body.price || existingProduct.price,
                category: req.body.category || existingProduct.category,
                countInStock: req.body.countInStock || existingProduct.countInStock,
                rating: req.body.rating || existingProduct.rating,
                numReviews: req.body.numReviews || existingProduct.numReviews,
                isFeatured: req.body.isFeatured || existingProduct.isFeatured,
            },
            { new: true }
        );

        res.send(product);
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

// ✅ DELETE a product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found!" });
        }
        res.status(200).json({ success: true, message: 'The product is deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ GET product count
router.get(`/get/count`, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        res.send({ productCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ GET featured products
router.get(`/get/featured/:count`, async (req, res) => {
    try {
        const count = req.params.count ? parseInt(req.params.count) : 0;
        const products = await Product.find({ isFeatured: true }).limit(count);
        res.send(products);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ UPDATE product gallery images
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).send('Invalid Product Id');

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found!');

        const imagesPaths = req.files.map(file => `${req.protocol}://${req.get('host')}/public/uploads/${file.filename}`);

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { images: imagesPaths }, { new: true });

        res.send(updatedProduct);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
