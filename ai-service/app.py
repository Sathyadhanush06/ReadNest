from flask import Flask, jsonify, request
from recommendation_engine import ContentBasedRecommender, CollaborativeRecommender
import os

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "OK", "message": "Flask recommendation service is active"})

@app.route('/api/recommendations/user/<int:user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    """Fetch collaborative filtering recommendations for user."""
    try:
        # Re-initialize engine to ensure we load the latest ratings/orders from DB
        recommender = CollaborativeRecommender()
        recommendations = recommender.get_recommendations(user_id, limit=6)
        return jsonify(recommendations)
    except Exception as e:
        print(f"Error in user recommendations API: {e}")
        return jsonify([]), 500

@app.route('/api/recommendations/book/<int:book_id>', methods=['GET'])
def get_similar_books(book_id):
    """Fetch content-based filtering similarities for a book."""
    try:
        # Re-initialize engine to ensure we load the latest book metadata
        recommender = ContentBasedRecommender()
        similar_ids = recommender.get_similar_books(book_id, limit=6)
        return jsonify(similar_ids)
    except Exception as e:
        print(f"Error in book similarity API: {e}")
        return jsonify([]), 500

if __name__ == '__main__':
    # Retrieve port from env or default to 5001
    port = int(os.environ.get("FLASK_PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
