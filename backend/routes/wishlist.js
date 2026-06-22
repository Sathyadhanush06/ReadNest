const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Get user wishlist
router.get('/', auth, async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT w.id as wishlist_id, b.*
      FROM wishlist w
      JOIN books b ON w.book_id = b.id
      WHERE w.user_id = ?
    `, [req.user.id]);
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving wishlist' });
  }
});

// Add to wishlist
router.post('/', auth, async (req, res) => {
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({ message: 'Please provide a bookId' });
  }

  try {
    // Check if book exists
    const [books] = await pool.query('SELECT * FROM books WHERE id = ?', [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if already in wishlist
    const [existing] = await pool.query('SELECT * FROM wishlist WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Book is already in wishlist' });
    }

    const [result] = await pool.query(
      'INSERT INTO wishlist (user_id, book_id) VALUES (?, ?)',
      [req.user.id, bookId]
    );

    res.status(201).json({
      message: 'Added to wishlist successfully',
      wishlistId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding to wishlist' });
  }
});

// Delete from wishlist (can pass bookId in params)
router.delete('/:bookId', auth, async (req, res) => {
  const bookId = parseInt(req.params.bookId);

  try {
    // Delete by matching user_id and book_id
    const [result] = await pool.query('DELETE FROM wishlist WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]);
    
    // Fallback: if it was a wishlist record ID instead of book ID
    if (result.affectedRows === 0) {
      const [fallbackResult] = await pool.query('DELETE FROM wishlist WHERE user_id = ? AND id = ?', [req.user.id, bookId]);
      if (fallbackResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Item not found in wishlist' });
      }
    }

    res.json({ message: 'Removed from wishlist successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error removing from wishlist' });
  }
});

module.exports = router;
