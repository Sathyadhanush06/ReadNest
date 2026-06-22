const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Get user cart
router.get('/', auth, async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT c.id as cart_id, c.quantity, b.*
      FROM cart c
      JOIN books b ON c.book_id = b.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving cart' });
  }
});

// Add item to cart
router.post('/', auth, async (req, res) => {
  const { bookId, quantity } = req.body;
  const qty = parseInt(quantity) || 1;

  if (!bookId) {
    return res.status(400).json({ message: 'Please provide a bookId' });
  }

  try {
    // Check book stock
    const [books] = await pool.query('SELECT stock FROM books WHERE id = ?', [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = books[0];
    if (book.stock < qty) {
      return res.status(400).json({ message: `Insufficient stock. Only ${book.stock} left.` });
    }

    // Check if item already exists in cart
    const [existing] = await pool.query('SELECT * FROM cart WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]);
    
    if (existing.length > 0) {
      // Update quantity
      const newQty = existing[0].quantity + qty;
      if (book.stock < newQty) {
        return res.status(400).json({ message: `Cannot add more. Insufficient stock (max ${book.stock}).` });
      }
      
      await pool.query(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ?',
        [newQty, req.user.id, bookId]
      );
      return res.json({ message: 'Cart item quantity updated' });
    }

    // Add to cart
    await pool.query(
      'INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)',
      [req.user.id, bookId, qty]
    );

    res.status(201).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
});

// Update item quantity in cart
router.put('/', auth, async (req, res) => {
  const { bookId, quantity } = req.body;
  const qty = parseInt(quantity);

  if (!bookId || qty === undefined || isNaN(qty) || qty <= 0) {
    return res.status(400).json({ message: 'Please provide bookId and a valid quantity greater than 0' });
  }

  try {
    // Check book stock
    const [books] = await pool.query('SELECT stock FROM books WHERE id = ?', [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = books[0];
    if (book.stock < qty) {
      return res.status(400).json({ message: `Insufficient stock. Only ${book.stock} available.` });
    }

    const [result] = await pool.query(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ?',
      [qty, req.user.id, bookId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating cart' });
  }
});

// Remove item from cart
router.delete('/:bookId', auth, async (req, res) => {
  const bookId = parseInt(req.params.bookId);

  try {
    const [result] = await pool.query('DELETE FROM cart WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]);
    
    // Fallback: delete by cart entry ID
    if (result.affectedRows === 0) {
      const [fallbackResult] = await pool.query('DELETE FROM cart WHERE user_id = ? AND id = ?', [req.user.id, bookId]);
      if (fallbackResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
});

module.exports = router;
