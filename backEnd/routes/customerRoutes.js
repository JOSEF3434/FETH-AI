const express = require('express');
const { deposit, getCustomerByEmail,updateCustomerBalance } = require('../controllers/customerController');
const router = express.Router();

// POST: Deposit money
router.post('/deposit', deposit);

// GET: Fetch customer by email
router.get('/:email', getCustomerByEmail);

// Add the PUT route here
router.put('/:email', updateCustomerBalance);

module.exports = router;
