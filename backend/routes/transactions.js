const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Transaction = require('../models/Transaction');
const { authMiddleware } = require('../middleware/auth');

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// POST — Create transaction
router.post('/', [authMiddleware, upload.single('proof')], async (req, res) => {
    try {
        const { date, generalOffering, specialOffering, specialOfferingNames, tithe, titheNames, expenses, expenseDetails, remarks } = req.body;

        const newTransaction = new Transaction({
            date: date ? new Date(date) : Date.now(),
            generalOffering: Number(generalOffering) || 0,
            specialOffering: Number(specialOffering) || 0,
            specialOfferingNames: specialOfferingNames || '',
            tithe: Number(tithe) || 0,
            titheNames: titheNames || '',
            expenses: Number(expenses) || 0,
            expenseDetails: expenseDetails || '',
            remarks: remarks || '',
            createdBy: req.user.id
        });

        if (req.file) {
            newTransaction.proofUrl = `/uploads/${req.file.filename}`;
        }

        const saved = await newTransaction.save();
        res.json(saved);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET — Fetch transactions (supports year/month filtering)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate, year, month } = req.query;
        let query = {};

        // Year/Month based filtering
        if (year && month) {
            const y = parseInt(year);
            const m = parseInt(month) - 1; // JS months are 0-indexed
            const start = new Date(y, m, 1);
            const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        } else if (year) {
            const y = parseInt(year);
            query.date = { $gte: new Date(y, 0, 1), $lte: new Date(y, 11, 31, 23, 59, 59, 999) };
        } else if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query).sort({ date: 1 }).populate('createdBy', 'name role');
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT — Update transaction
router.put('/:id', [authMiddleware, upload.single('proof')], async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

        const { date, generalOffering, specialOffering, specialOfferingNames, tithe, titheNames, expenses, expenseDetails, remarks } = req.body;

        if (date) transaction.date = new Date(date);
        if (generalOffering !== undefined) transaction.generalOffering = Number(generalOffering) || 0;
        if (specialOffering !== undefined) transaction.specialOffering = Number(specialOffering) || 0;
        if (specialOfferingNames !== undefined) transaction.specialOfferingNames = specialOfferingNames;
        if (tithe !== undefined) transaction.tithe = Number(tithe) || 0;
        if (titheNames !== undefined) transaction.titheNames = titheNames;
        if (expenses !== undefined) transaction.expenses = Number(expenses) || 0;
        if (expenseDetails !== undefined) transaction.expenseDetails = expenseDetails;
        if (remarks !== undefined) transaction.remarks = remarks;

        if (req.file) {
            if (transaction.proofUrl) {
                const oldPath = path.join(__dirname, '..', transaction.proofUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            transaction.proofUrl = `/uploads/${req.file.filename}`;
        }

        await transaction.save();
        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE — Remove transaction
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

        if (transaction.proofUrl) {
            const filePath = path.join(__dirname, '..', transaction.proofUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await transaction.deleteOne();
        res.json({ msg: 'Transaction removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
