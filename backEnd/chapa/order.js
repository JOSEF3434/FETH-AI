import { Order } from '../models/Order.js';
import { Menu } from '../models/Menu.js';
import { Customer } from '../models/Customer.js';
import { initiateChapaPayment, verifyChapaPayment } from '../services/chapaService.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new order (status = pending by default)
export const createOrder = async (req, res) => {
  try {
    const customerId = req.id;
    const { items, campus, building, roomNumber } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    let totalPrice = 0;
    const orderItems = [];

    // Calculate total price and prepare order items
    for (const item of items) {
      const menu = await Menu.findById(item.menuId);
      if (!menu || !menu.available) {
        return res.status(400).json({ message: `Menu item not found or unavailable: ${item.menuId}` });
      }

      const itemTotal = menu.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        menuId: menu._id,
        name: menu.name,
        priceAtPurchase: menu.price,
        quantity: item.quantity,
      });
    }

    // Create a temporary order with payment status pending
    const tx_ref = `order-${uuidv4()}`;
    const order = await Order.create({
      customer: customerId,
      items: orderItems,
      totalPrice,
      campus,
      building,
      roomNumber,
      status: 'pending',
      paymentStatus: 'pending',
      paymentReference: tx_ref,
    });

    // Prepare payment data for Chapa
    const paymentData = {
      amount: totalPrice.toString(),
      customerEmail: customer.email,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      tx_ref: tx_ref,
    };

    // Initiate Chapa payment
    const paymentResponse = await initiateChapaPayment(paymentData);

    // Return payment URL to frontend
    res.status(201).json({
      order,
      paymentUrl: paymentResponse.data.checkout_url,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error creating order', error: error.message });
  }
};

// Add payment verification endpoint
export const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    // Verify payment with Chapa
    const paymentVerification = await verifyChapaPayment(tx_ref);

    if (paymentVerification.status !== 'success') {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update order payment status
    const order = await Order.findOneAndUpdate(
      { paymentReference: tx_ref },
      { paymentStatus: 'paid' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update customer's order history
    const customer = await Customer.findById(order.customer);
    if (customer) {
      const orderHistoryItem = customer.orderHistory.find(
        (item) => item.orderId.toString() === order._id.toString()
      );
      
      if (orderHistoryItem) {
        orderHistoryItem.status = order.status;
      }
      
      await customer.save();
    }

    res.json({ message: 'Payment verified successfully', order });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

// Payment callback handler (for Chapa webhook)
export const paymentCallback = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    if (status !== 'success') {
      return res.status(400).json({ message: 'Payment failed' });
    }

    // Update order payment status
    await Order.findOneAndUpdate(
      { paymentReference: tx_ref },
      { paymentStatus: 'paid' }
    );

    res.status(200).json({ message: 'Payment callback processed' });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ message: 'Error processing payment callback' });
  }
};

// Get all orders (FIFO)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: 1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get orders by customer ID
export const getOrdersByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;

    const orders = await Order.find({ customer: customerId })
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: 1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer orders' });
  }
};

// Get orders by status (FIFO)
export const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const orders = await Order.find({ status })
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: 1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders by status' });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'inProgress', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
};