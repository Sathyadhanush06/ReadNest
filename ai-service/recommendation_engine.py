import re
import math
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../backend/.env'))

# Basic stopwords list for text cleaning
STOPWORDS = set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
    'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
    'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres',
    'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into',
    'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not',
    'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
    'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that',
    'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd',
    'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
    'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres',
    'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd',
    'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves'
])

def get_db_connection():
    """Establish connection to MySQL database."""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', '127.0.0.1'),
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'readnest')
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def clean_and_tokenize(text):
    """Normalize, remove punctuation, remove stopwords, and return list of tokens."""
    if not text:
        return []
    text = text.lower()
    # Replace non-alphabetic chars with spaces
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    tokens = text.split()
    return [t for t in tokens if t not in STOPWORDS and len(t) > 1]

class ContentBasedRecommender:
    """Calculates similarity between books using TF-IDF of title, author, genre, and description."""
    
    def __init__(self):
        self.books = {} # book_id -> {title, author, genre, description, tokens}
        self.vocabulary = set()
        self.idf = {}
        self.tfidf_vectors = {} # book_id -> dict(term -> weight)
        self.load_data()
        self.compute_tfidf()

    def load_data(self):
        conn = get_db_connection()
        if not conn:
            return
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT id, title, author, genre, description FROM books")
            rows = cursor.fetchall()
            for row in rows:
                book_id = row['id']
                # Combine fields to create a corpus document
                corpus_text = f"{row['title']} {row['author']} {row['genre']} {row['description']}"
                tokens = clean_and_tokenize(corpus_text)
                self.books[book_id] = {
                    'title': row['title'],
                    'author': row['author'],
                    'genre': row['genre'],
                    'description': row['description'],
                    'tokens': tokens
                }
                for t in tokens:
                    self.vocabulary.add(t)
        except Error as e:
            print(f"Error loading books for recommender: {e}")
        finally:
            cursor.close()
            conn.close()

    def compute_tfidf(self):
        """Computes the term frequency-inverse document frequency matrix."""
        if not self.books:
            return

        total_docs = len(self.books)
        doc_frequency = {}

        # 1. Calculate Document Frequency (DF) for each term
        for book_id, info in self.books.items():
            unique_tokens = set(info['tokens'])
            for term in unique_tokens:
                doc_frequency[term] = doc_frequency.get(term, 0) + 1

        # 2. Calculate Inverse Document Frequency (IDF)
        for term, df in doc_frequency.items():
            self.idf[term] = math.log(1 + (total_docs / (1 + df)))

        # 3. Calculate TF-IDF Vectors
        for book_id, info in self.books.items():
            tokens = info['tokens']
            if not tokens:
                self.tfidf_vectors[book_id] = {}
                continue
            
            # Count term frequencies
            tf_counts = {}
            for t in tokens:
                tf_counts[t] = tf_counts.get(t, 0) + 1
            
            vector = {}
            for term, count in tf_counts.items():
                tf = count / len(tokens)
                vector[term] = tf * self.idf.get(term, 0.0)
            
            # Normalize vector (Euclidean L2 norm)
            norm = math.sqrt(sum(w ** 2 for w in vector.values()))
            if norm > 0:
                for term in vector:
                    vector[term] /= norm
            
            self.tfidf_vectors[book_id] = vector

    def get_similar_books(self, target_book_id, limit=6):
        """Finds top N books similar to the target book ID using Cosine Similarity."""
        if target_book_id not in self.tfidf_vectors:
            return []

        target_vector = self.tfidf_vectors[target_book_id]
        similarities = []

        for book_id, vector in self.tfidf_vectors.items():
            if book_id == target_book_id:
                continue
            
            # Dot product of normalized vectors (since vectors are L2-normalized, magnitude is 1)
            dot_product = 0.0
            for term, weight in target_vector.items():
                if term in vector:
                    dot_product += weight * vector[term]
            
            similarities.append((book_id, dot_product))
        
        # Sort by similarity score descending
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [item[0] for item in similarities[:limit]]


class CollaborativeRecommender:
    """Generates personalized suggestions using User-User collaborative filtering."""

    def __init__(self):
        self.user_ratings = {} # user_id -> {book_id -> rating}
        self.user_purchases = {} # user_id -> set(book_id)
        self.load_data()

    def load_data(self):
        conn = get_db_connection()
        if not conn:
            return
        cursor = conn.cursor(dictionary=True)
        try:
            # 1. Load reviews
            cursor.execute("SELECT user_id, book_id, rating FROM reviews")
            for row in cursor.fetchall():
                uid, bid, rating = row['user_id'], row['book_id'], row['rating']
                if uid not in self.user_ratings:
                    self.user_ratings[uid] = {}
                self.user_ratings[uid][bid] = float(rating)

            # 2. Load order items to capture implicit interest (score = 4.0 if unrated)
            cursor.execute("""
                SELECT o.user_id, oi.book_id
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
            """)
            for row in cursor.fetchall():
                uid, bid = row['user_id'], row['book_id']
                if uid not in self.user_purchases:
                    self.user_purchases[uid] = set()
                self.user_purchases[uid].add(bid)
                
                # If they purchased but didn't review, give implicit positive rating
                if uid not in self.user_ratings:
                    self.user_ratings[uid] = {}
                if bid not in self.user_ratings[uid]:
                    self.user_ratings[uid][bid] = 4.0

        except Error as e:
            print(f"Error loading user reviews/orders for recommender: {e}")
        finally:
            cursor.close()
            conn.close()

    def calculate_user_similarity(self, user1, user2):
        """Calculates Cosine Similarity of ratings between two users."""
        if user1 not in self.user_ratings or user2 not in self.user_ratings:
            return 0.0

        ratings1 = self.user_ratings[user1]
        ratings2 = self.user_ratings[user2]

        common_books = set(ratings1.keys()) & set(ratings2.keys())
        if not common_books:
            return 0.0

        # Compute dot product and vectors magnitude
        dot_product = sum(ratings1[bid] * ratings2[bid] for bid in common_books)
        mag1 = math.sqrt(sum(r ** 2 for r in ratings1.values()))
        mag2 = math.sqrt(sum(r ** 2 for r in ratings2.values()))

        if mag1 == 0 or mag2 == 0:
            return 0.0
        return dot_product / (mag1 * mag2)

    def get_recommendations(self, target_user_id, limit=6):
        """Recommends books user has not read yet using scores weighted by user similarities."""
        if target_user_id not in self.user_ratings:
            return []

        target_ratings = self.user_ratings[target_user_id]
        
        # Calculate similarity with all other users
        similarities = {}
        for other_user_id in self.user_ratings:
            if other_user_id == target_user_id:
                continue
            sim = self.calculate_user_similarity(target_user_id, other_user_id)
            if sim > 0.1: # Only consider reasonably similar users
                similarities[other_user_id] = sim

        if not similarities:
            return []

        # Predict ratings for books target user hasn't rated/purchased yet
        scores = {}
        sim_sums = {}

        for other_user, sim in similarities.items():
            for book_id, rating in self.user_ratings[other_user].items():
                if book_id in target_ratings:
                    continue # Already interacted
                
                scores[book_id] = scores.get(book_id, 0.0) + (rating * sim)
                sim_sums[book_id] = sim_sums.get(book_id, 0.0) + sim

        # Normalize score predictions
        predicted_rankings = []
        for book_id, total_weighted_rating in scores.items():
            if sim_sums[book_id] > 0:
                predicted_rankings.append((book_id, total_weighted_rating / sim_sums[book_id]))

        predicted_rankings.sort(key=lambda x: x[1], reverse=True)
        return [item[0] for item in predicted_rankings[:limit]]
