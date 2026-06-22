-- Seed data for ReadNest Bookstore
USE readnest;

-- Clean existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE reviews;
TRUNCATE TABLE wishlist;
TRUNCATE TABLE cart;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE marketplace_listings;
TRUNCATE TABLE books;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users (Password is 'password123' hashed using bcrypt)
-- Hash: $2a$10$1Bb.hrMBEX6.ICmVy7Dq..jcBXx3Bm/pvUwCZti/4N6p/bvHgdzq2
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'System Admin', 'admin@readnest.com', '$2a$10$1Bb.hrMBEX6.ICmVy7Dq..jcBXx3Bm/pvUwCZti/4N6p/bvHgdzq2', 'admin'),
(2, 'Book Seller', 'seller@readnest.com', '$2a$10$1Bb.hrMBEX6.ICmVy7Dq..jcBXx3Bm/pvUwCZti/4N6p/bvHgdzq2', 'seller'),
(3, 'John Doe', 'john@readnest.com', '$2a$10$1Bb.hrMBEX6.ICmVy7Dq..jcBXx3Bm/pvUwCZti/4N6p/bvHgdzq2', 'customer'),
(4, 'Alice Smith', 'alice@readnest.com', '$2a$10$1Bb.hrMBEX6.ICmVy7Dq..jcBXx3Bm/pvUwCZti/4N6p/bvHgdzq2', 'customer'),
(5, 'Bob Johnson', 'bob@readnest.com', '$2a$10$1Bb.hrMBEX6.ICmVy7Dq..jcBXx3Bm/pvUwCZti/4N6p/bvHgdzq2', 'customer'),
(6, 'Clara Oswald', 'clara@readnest.com', '$2a$10$1Bb.hrMBEX6.ICmVy7Dq..jcBXx3Bm/pvUwCZti/4N6p/bvHgdzq2', 'customer');

-- 2. Insert Books
INSERT INTO books (id, title, author, genre, description, price, stock, image_url) VALUES
(1, 'The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 'A legendary fantasy adventure about Bilbo Baggins and his quest to win a share of the treasure guarded by Smaug the dragon.', 14.99, 15, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'),
(2, 'The Fellowship of the Ring', 'J.R.R. Tolkien', 'Fantasy', 'The first volume of the epic fantasy trilogy, detailing the gathering of the fellowship and their quest to destroy the One Ring.', 19.99, 10, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'),
(3, 'Dune', 'Frank Herbert', 'Sci-Fi', 'Set in the far future amidst a sprawling feudal interstellar empire, Dune tells the story of Paul Atreides as he navigates the dangerous desert planet Arrakis.', 15.99, 8, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400'),
(4, 'Neuromancer', 'William Gibson', 'Sci-Fi', 'A classic cyberpunk novel that follows Case, a low-life data-thief in a dystopian future, who is hired for one last hack.', 12.99, 12, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400'),
(5, 'The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan in the Roaring Twenties.', 9.99, 20, 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?auto=format&fit=crop&q=80&w=400'),
(6, 'To Kill a Mockingbird', 'Harper Lee', 'Fiction', 'The story of Scout Finch, her brother Jem, and their father Atticus Finch, a lawyer defending a black man accused of raping a white woman.', 10.99, 25, 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400'),
(7, 'The Silent Patient', 'Alex Michaelides', 'Mystery', 'Alicia Berenson’s life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she shoots her husband in the face five times and then never speaks another word.', 13.50, 14, 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400'),
(8, 'The Girl with the Dragon Tattoo', 'Stieg Larsson', 'Mystery', 'A brilliant hacker and a down-on-his-luck journalist team up to solve a forty-year-old murder mystery involving a wealthy Swedish industrial family.', 11.99, 9, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=400'),
(9, 'Educated', 'Tara Westover', 'Biography', 'An unforgettable memoir about a young girl who, kept out of school by her survivalist parents, leaves her family and goes on to earn a PhD from Cambridge University.', 16.00, 11, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400'),
(10, 'Steve Jobs', 'Walter Isaacson', 'Biography', 'The exclusive biography of Steve Jobs, based on more than forty interviews with Jobs conducted over two years.', 18.50, 7, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400'),
(11, 'A Brief History of Time', 'Stephen Hawking', 'Science', 'A landmark volume in science writing by one of the great minds of our time, exploring the universe, black holes, space-time, and the Big Bang.', 15.00, 10, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400'),
(12, 'Cosmos', 'Carl Sagan', 'Science', 'Sagan explores the universe, the history of science, and the future of humanity, based on his legendary television series.', 16.99, 6, 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=400'),
(13, 'Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy', 'Harry Potter discovers on his eleventh birthday that he is the orphaned son of two powerful wizards and possesses unique magic powers of his own.', 12.99, 30, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400'),
(14, 'Foundation', 'Isaac Asimov', 'Sci-Fi', 'The galactic empire is dying, and Hari Seldon has predicted a dark age lasting thirty thousand years. He establishes the Foundation to preserve human knowledge.', 13.99, 15, 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&q=80&w=400'),
(15, 'Brave New World', 'Aldous Huxley', 'Sci-Fi', 'A dystopian vision of a futuristic society where citizens are genetically engineered, socially conditioned, and pharmacologically anesthetized.', 11.50, 18, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400');

-- 3. Insert Reviews (Collaborative filtering relies on this mapping)
-- Users: John(3), Alice(4), Bob(5), Clara(6)
-- Books: Hobbit(1), Fellowship(2), Dune(3), Neuromancer(4), Gatsby(5), Mockingbird(6), SilentPatient(7), DragonTattoo(8), Educated(9), SteveJobs(10), BriefHistory(11), Cosmos(12)
INSERT INTO reviews (user_id, book_id, rating, comment) VALUES
-- John likes Fantasy and Sci-Fi
(3, 1, 5, 'An absolute classic. Read it to my kids and they loved it!'),
(3, 2, 5, 'Incredible world-building, Tolkien is a master.'),
(3, 3, 4, 'Very deep world, though the political plots can be a bit dense.'),
(3, 4, 4, 'Cyberpunk at its best. Great atmosphere.'),
-- Alice likes Sci-Fi and Science
(4, 3, 5, 'My absolute favorite sci-fi novel! The spice must flow.'),
(4, 4, 5, 'Mind-bending cyberpunk concept. Extremely influential.'),
(4, 11, 4, 'Makes complex physics concepts digestible for the general public.'),
(4, 12, 5, 'Beautifully written exploration of the cosmos and our place in it.'),
-- Bob likes Fiction and Mystery
(5, 5, 4, 'A poignant look at the American Dream. Great prose.'),
(5, 6, 5, 'A masterpiece of American literature. Deeply moving.'),
(5, 7, 5, 'Incredible thriller! Did not see the ending coming.'),
(5, 8, 4, 'Dark but engrossing. Lisbeth Salander is a fantastic character.'),
-- Clara likes Biography and Fiction
(6, 5, 5, 'Gatsby is just a phenomenal character. Classic story.'),
(6, 6, 4, 'Classic story that remains highly relevant today.'),
(6, 9, 5, 'An inspiring and heartbreaking story of resilience and education.'),
(6, 10, 4, 'A great look inside the mind of a tech genius and visionary.'),
-- Some overlapping items for collaborative filtering overlap
(3, 13, 5, 'Superb fantasy book! Reminds me of Hobbit.'),
(4, 13, 4, 'Fun read, though targeted slightly younger.'),
(5, 13, 3, 'Okay, but I prefer more mature fiction.'),
(3, 11, 4, 'Interesting science book, John liked it.');

-- 4. Wishlist Mock
INSERT INTO wishlist (user_id, book_id) VALUES
(3, 7), -- John wishes for The Silent Patient
(3, 9), -- John wishes for Educated
(4, 1), -- Alice wishes for The Hobbit
(5, 1), -- Bob wishes for The Hobbit
(5, 3); -- Bob wishes for Dune

-- 5. Used Book Marketplace Listings
INSERT INTO marketplace_listings (seller_id, book_name, condition_state, price, status) VALUES
(2, 'The Hobbit (Used)', 'Good', 6.50, 'available'),
(2, 'Dune (Softcover)', 'Like New', 9.00, 'available'),
(3, 'To Kill a Mockingbird (Old Print)', 'Fair', 4.00, 'available'),
(4, 'Educated (Hardcover)', 'Good', 8.00, 'available'),
(5, 'Steve Jobs Biography', 'Like New', 10.00, 'sold');
