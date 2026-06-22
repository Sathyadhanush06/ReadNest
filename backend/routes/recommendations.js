const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

const FLASK_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:5001/api/recommendations';

// Fallback: Get top books by rating when Python service is unavailable
const getPopularFallback = async () => {
  const [rows] = await pool.query(`
    SELECT b.*, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as review_count
    FROM books b
    LEFT JOIN reviews r ON b.id = r.book_id
    GROUP BY b.id
    ORDER BY average_rating DESC, review_count DESC
    LIMIT 6
  `);
  return rows;
};

// Fallback: Get similar genre books when Python service is unavailable
const getGenreFallback = async (bookId) => {
  const [currentBook] = await pool.query('SELECT genre FROM books WHERE id = ?', [bookId]);
  if (currentBook.length === 0) return [];
  const genre = currentBook[0].genre;
  
  const [rows] = await pool.query(`
    SELECT b.*, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as review_count
    FROM books b
    LEFT JOIN reviews r ON b.id = r.book_id
    WHERE b.id != ? AND b.genre = ?
    GROUP BY b.id
    ORDER BY average_rating DESC
    LIMIT 6
  `, [bookId, genre]);
  
  return rows;
};

// Get personalized recommendations for user
router.get('/user', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const response = await axios.get(`${FLASK_SERVICE_URL}/user/${userId}`, { timeout: 1500 });
    const bookIds = response.data; // Array of recommended book IDs e.g. [1, 3, 5]

    if (bookIds && bookIds.length > 0) {
      // Fetch book details from IDs preserving order
      const placeholders = bookIds.map(() => '?').join(',');
      const [books] = await pool.query(`
        SELECT b.*, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as review_count
        FROM books b
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE b.id IN (${placeholders})
        GROUP BY b.id
      `, bookIds);

      // Re-order books to match recommendation weights/sequence
      const bookMap = {};
      books.forEach(b => bookMap[b.id] = b);
      const sortedBooks = bookIds.map(id => bookMap[id]).filter(Boolean);
      
      return res.json(sortedBooks);
    }

    // Default return popular if model is still cold
    const popular = await getPopularFallback();
    res.json(popular);
  } catch (error) {
    console.warn('Flask recommendation service unreachable or failed. Falling back to SQL ratings.', error.message);
    const popular = await getPopularFallback();
    res.json(popular);
  }
});

// Get similar books (Content-based recommendations for book detail pages)
router.get('/book/:bookId', async (req, res) => {
  const bookId = parseInt(req.params.bookId);

  try {
    const response = await axios.get(`${FLASK_SERVICE_URL}/book/${bookId}`, { timeout: 1500 });
    const bookIds = response.data;

    if (bookIds && bookIds.length > 0) {
      const placeholders = bookIds.map(() => '?').join(',');
      const [books] = await pool.query(`
        SELECT b.*, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as review_count
        FROM books b
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE b.id IN (${placeholders})
        GROUP BY b.id
      `, bookIds);

      const bookMap = {};
      books.forEach(b => bookMap[b.id] = b);
      const sortedBooks = bookIds.map(id => bookMap[id]).filter(Boolean);

      return res.json(sortedBooks);
    }

    const fallback = await getGenreFallback(bookId);
    res.json(fallback);
  } catch (error) {
    console.warn('Flask recommendation service unreachable or failed for similar books. Falling back to genre matching.', error.message);
    const fallback = await getGenreFallback(bookId);
    res.json(fallback);
  }
});

module.exports = router;
