const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    generalOffering: {
        type: Number,
        default: 0,
    },
    specialOffering: {
        type: Number,
        default: 0,
    },
    specialOfferingNames: {
        type: String,
        default: '',
    },
    tithe: {
        type: Number,
        default: 0,
    },
    titheNames: {
        type: String,
        default: '',
    },
    expenses: {
        type: Number,
        default: 0,
    },
    expenseDetails: {
        type: String,
        default: '',
    },
    remarks: {
        type: String,
        default: '',
    },
    proofUrl: {
        type: String,
        default: null,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
