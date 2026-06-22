const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, checkRole } = require('../middleware/auth');

// Get all books + search & filter
router.get('/', async (req, res) => {
  const { search, genre, minPrice, maxPrice, minRating, sort } = req.query;

  let query = `
    SELECT b.*, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as review_count
    FROM books b
    LEFT JOIN reviews r ON b.id = r.book_id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)';
    const searchWild = `%${search}%`;
    params.push(searchWild, searchWild, searchWild);
  }

  if (genre) {
    query += ' AND b.genre = ?';
    params.push(genre);
  }

  if (minPrice) {
    query += ' AND b.price >= ?';
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    query += ' AND b.price <= ?';
    params.push(parseFloat(maxPrice));
  }

  query += ' GROUP BY b.id';

  // Filter by rating (using HAVING because average_rating is an aggregate function)
  if (minRating) {
    query += ' HAVING average_rating >= ?';
    params.push(parseFloat(minRating));
  }

  // Sorting
  if (sort === 'price_asc') {
    query += ' ORDER BY b.price ASC';
  } else if (sort === 'price_desc') {
    query += ' ORDER BY b.price DESC';
  } else if (sort === 'rating_desc') {
    query += ' ORDER BY average_rating DESC';
  } else {
    query += ' ORDER BY b.created_at DESC';
  }

  try {
    const [books] = await pool.query(query, params);
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving books' });
  }
});

// Get a single book (including average rating and review list)
router.get('/:id', async (req, res) => {
  const bookId = parseInt(req.params.id);

  try {
    const [books] = await pool.query(`
      SELECT b.*, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as review_count
      FROM books b
      LEFT JOIN reviews r ON b.id = r.book_id
      WHERE b.id = ?
      GROUP BY b.id
    `, [bookId]);

    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Also fetch reviews for this book
    const [reviews] = await pool.query(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = ?
      ORDER BY r.created_at DESC
    `, [bookId]);

    const book = books[0];
    book.reviews = reviews;

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving book details' });
  }
});

// Add new book (Admin only)
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  const { title, author, genre, description, price, stock, image_url } = req.body;

  if (!title || !author || !genre || !description || price === undefined || stock === undefined) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO books (title, author, genre, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, author, genre, description, parseFloat(price), parseInt(stock), image_url || null]
    );

    res.status(201).json({
      message: 'Book added successfully',
      bookId: result.insertId,
      book: { id: result.insertId, title, author, genre, description, price, stock, image_url }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding book' });
  }
});

// Update book (Admin only)
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  const bookId = parseInt(req.params.id);
  const { title, author, genre, description, price, stock, image_url } = req.body;

  if (!title || !author || !genre || !description || price === undefined || stock === undefined) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE books SET title = ?, author = ?, genre = ?, description = ?, price = ?, stock = ?, image_url = ? WHERE id = ?',
      [title, author, genre, description, parseFloat(price), parseInt(stock), image_url || null, bookId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      message: 'Book updated successfully',
      book: { id: bookId, title, author, genre, description, price, stock, image_url }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating book' });
  }
});

// Delete book (Admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  const bookId = parseInt(req.params.id);

  try {
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [bookId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting book' });
  }
});

module.exports = router;
