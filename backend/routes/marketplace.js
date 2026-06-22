const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Get all available marketplace listings
router.get('/', async (req, res) => {
  try {
    const [listings] = await pool.query(`
      SELECT ml.*, u.name as seller_name, u.email as seller_email
      FROM marketplace_listings ml
      JOIN users u ON ml.seller_id = u.id
      WHERE ml.status = 'available'
      ORDER BY ml.created_at DESC
    `);
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving marketplace listings' });
  }
});

// Get marketplace listings created by current user
router.get('/my-listings', auth, async (req, res) => {
  try {
    const [listings] = await pool.query(
      'SELECT * FROM marketplace_listings WHERE seller_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving your listings' });
  }
});

// Add new listing (Available to any authenticated user to sell their used books)
router.post('/', auth, async (req, res) => {
  const { bookName, condition, price } = req.body;
  const sellerId = req.user.id;

  if (!bookName || !condition || price === undefined) {
    return res.status(400).json({ message: 'Please provide bookName, condition and price' });
  }

  const validConditions = ['Like New', 'Good', 'Fair', 'Poor'];
  if (!validConditions.includes(condition)) {
    return res.status(400).json({ message: 'Invalid condition. Choose from: ' + validConditions.join(', ') });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO marketplace_listings (seller_id, book_name, condition_state, price, status) VALUES (?, ?, ?, ?, ?)',
      [sellerId, bookName, condition, parseFloat(price), 'available']
    );

    res.status(201).json({
      message: 'Marketplace listing created successfully',
      listingId: result.insertId,
      listing: { id: result.insertId, seller_id: sellerId, book_name: bookName, condition_state: condition, price, status: 'available' }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating listing' });
  }
});

// Edit listing (Owner only)
router.put('/:id', auth, async (req, res) => {
  const listingId = parseInt(req.params.id);
  const { bookName, condition, price, status } = req.body;
  const userId = req.user.id;

  try {
    // Check if listing exists and verify owner
    const [listings] = await pool.query('SELECT * FROM marketplace_listings WHERE id = ?', [listingId]);
    if (listings.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = listings[0];
    if (listing.seller_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You are not the seller of this book' });
    }

    // Prepare update parameters
    const updatedBookName = bookName || listing.book_name;
    const updatedCondition = condition || listing.condition_state;
    const updatedPrice = price !== undefined ? parseFloat(price) : listing.price;
    const updatedStatus = status || listing.status;

    await pool.query(
      'UPDATE marketplace_listings SET book_name = ?, condition_state = ?, price = ?, status = ? WHERE id = ?',
      [updatedBookName, updatedCondition, updatedPrice, updatedStatus, listingId]
    );

    res.json({
      message: 'Listing updated successfully',
      listing: { id: listingId, book_name: updatedBookName, condition_state: updatedCondition, price: updatedPrice, status: updatedStatus }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating listing' });
  }
});

// Delete listing (Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  const listingId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const [listings] = await pool.query('SELECT * FROM marketplace_listings WHERE id = ?', [listingId]);
    if (listings.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = listings[0];
    if (listing.seller_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You are not authorized to delete this listing' });
    }

    await pool.query('DELETE FROM marketplace_listings WHERE id = ?', [listingId]);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting listing' });
  }
});

// Purchase/Buy marketplace item (P2P transaction mock)
router.post('/:id/buy', auth, async (req, res) => {
  const listingId = parseInt(req.params.id);
  const buyerId = req.user.id;

  try {
    const [listings] = await pool.query('SELECT * FROM marketplace_listings WHERE id = ?', [listingId]);
    if (listings.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = listings[0];
    if (listing.status === 'sold') {
      return res.status(400).json({ message: 'Book already sold' });
    }

    if (listing.seller_id === buyerId) {
      return res.status(400).json({ message: 'You cannot purchase your own listed book' });
    }

    // Update status to sold
    await pool.query('UPDATE marketplace_listings SET status = "sold" WHERE id = ?', [listingId]);

    res.json({
      message: 'Used book purchased successfully!',
      transaction: {
        listingId,
        book_name: listing.book_name,
        price: listing.price,
        seller_id: listing.seller_id,
        buyer_id: buyerId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error purchasing marketplace listing' });
  }
});

module.exports = router;
