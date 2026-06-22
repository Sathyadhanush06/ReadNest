const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, checkRole } = require('../middleware/auth');

// Create order (Checkout cart)
router.post('/', auth, async (req, res) => {
  const userId = req.user.id;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Fetch user's cart items
    const [cartItems] = await connection.query(`
      SELECT c.quantity, b.id as book_id, b.price, b.stock, b.title
      FROM cart c
      JOIN books b ON c.book_id = b.id
      WHERE c.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Shopping cart is empty' });
    }

    // 2. Validate stock and calculate total
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: `Insufficient stock for book "${item.title}". Only ${item.stock} left.` });
      }
      totalAmount += item.price * item.quantity;
    }

    // 3. Create order entry
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [userId, totalAmount, 'pending']
    );
    const orderId = orderResult.insertId;

    // 4. Create order items and decrement book stock
    for (const item of cartItems) {
      // Insert item
      await connection.query(
        'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.book_id, item.quantity, item.price]
      );

      // Decrement stock
      await connection.query(
        'UPDATE books SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.book_id]
      );
    }

    // 5. Clear cart
    await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      totalAmount
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error(error);
    res.status(500).json({ message: 'Server error processing order' });
  }
});

// Get user orders (Admin gets ALL orders)
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let ordersQuery = '';
    let params = [];

    if (userRole === 'admin') {
      // Admin sees everything
      ordersQuery = `
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `;
    } else {
      // Regular customer sees their own
      ordersQuery = `
        SELECT * FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
      `;
      params.push(userId);
    }

    const [orders] = await pool.query(ordersQuery, params);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving orders' });
  }
});

// Get detailed order (by ID)
router.get('/:id', auth, async (req, res) => {
  const orderId = parseInt(req.params.id);
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const [orders] = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Authorize: Admin can see any order, customer can only see their own
    if (userRole !== 'admin' && order.user_id !== userId) {
      return res.status(403).json({ message: 'Access denied to view this order' });
    }

    // Get order items details
    const [items] = await pool.query(`
      SELECT oi.*, b.title, b.author, b.image_url
      FROM order_items oi
      JOIN books b ON oi.book_id = b.id
      WHERE oi.order_id = ?
    `, [orderId]);

    order.items = items;
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving order details' });
  }
});

// Update order status (Admin only)
router.put('/:id/status', auth, checkRole(['admin']), async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Please provide a valid status: ' + validStatuses.join(', ') });
  }

  try {
    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

module.exports = router;
