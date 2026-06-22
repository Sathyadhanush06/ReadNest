const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Create or update review for a book
router.post('/', auth, async (req, res) => {
  const { bookId, rating, comment } = req.body;
  const userId = req.user.id;

  const score = parseInt(rating);
  if (!bookId || isNaN(score) || score < 1 || score > 5) {
    return res.status(400).json({ message: 'Please provide bookId and a rating between 1 and 5' });
  }

  try {
    // Check if book exists
    const [books] = await pool.query('SELECT id FROM books WHERE id = ?', [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if review already exists
    const [existing] = await pool.query('SELECT id FROM reviews WHERE user_id = ? AND book_id = ?', [userId, bookId]);
    
    if (existing.length > 0) {
      // Update review
      await pool.query(
        'UPDATE reviews SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ? AND book_id = ?',
        [score, comment || null, userId, bookId]
      );
      return res.json({ message: 'Review updated successfully' });
    }

    // Insert new review
    await pool.query(
      'INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, bookId, score, comment || null]
    );

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting review' });
  }
});

// Get reviews for a book
router.get('/:bookId', async (req, res) => {
  const bookId = parseInt(req.params.bookId);

  try {
    const [reviews] = await pool.query(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = ?
      ORDER BY r.created_at DESC
    `, [bookId]);
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving reviews' });
  }
});

// Delete review (Review owner or Admin only)
router.delete('/:id', auth, async (req, res) => {
  const reviewId = parseInt(req.params.id);
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Fetch review
    const [reviews] = await pool.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);
    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = reviews[0];

    // Check authority
    if (userRole !== 'admin' && review.user_id !== userId) {
      return res.status(403).json({ message: 'Access denied: You cannot delete this review' });
    }

    await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting review' });
  }
});

module.exports = router;
