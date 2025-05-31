const Customer = require('../models/Customer');

// Deposit Currency
exports.deposit = async (req, res) => {
    const { email, amount, userName } = req.body;

    // Validate the deposit amount
    if (amount <= 0) return res.status(400).json({ error: 'Deposit amount must be greater than zero' });

    try {
        // Check if customer already exists
        let customer = await Customer.findOne({ email });
        if (!customer) {
            // If customer doesn't exist, create a new one with the deposit amount
            customer = new Customer({ name: userName, email, balance: amount });
            await customer.save();
            return res.status(201).json({ message: 'User created and deposit successful', balance: customer.balance });
        }

        // If customer exists, update their balance
        customer.balance += amount;
        await customer.save();
        res.status(200).json({ message: 'Deposit successful', balance: customer.balance });
    } catch (error) {
        console.error('Error processing deposit:', error);
        res.status(500).json({ error: 'Failed to process deposit' });
    }
};

// Fetch Customer by Email
exports.getCustomerByEmail = async (req, res) => {
    const { email } = req.params;

    try {
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ error: `Customer with email ${email} not found` });
        }
        res.status(200).json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
};

// Update Customer Balance
exports.updateCustomerBalance = async (req, res) => {
    const { email } = req.params;
    const { balance } = req.body;

    try {
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ error: `Customer with email ${email} not found` });
        }

        customer.balance = balance;
        await customer.save();

        res.status(200).json({ message: 'Balance updated successfully', balance: customer.balance });
    } catch (error) {
        console.error('Error updating balance:', error);
        res.status(500).json({ error: 'Failed to update balance' });
    }
};
