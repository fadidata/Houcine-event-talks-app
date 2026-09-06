import json
import os
import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

QUOTES_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "quotes.json")

def load_quotes():
    with open(QUOTES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

QUOTES = load_quotes()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/quote/random", methods=["GET"])
def get_random_quote():
    category = request.args.get("category", "").strip()
    pool = QUOTES
    if category and category.lower() != "all":
        pool = [q for q in QUOTES if q.get("category", "").lower() == category.lower()]

    if not pool:
        return jsonify({"error": "No quotes found for the requested category."}), 404

    return jsonify(random.choice(pool))

@app.route("/api/quotes", methods=["GET"])
def get_quotes():
    category = request.args.get("category", "").strip()
    author = request.args.get("author", "").strip()
    query = request.args.get("q", "").strip() or request.args.get("search", "").strip()

    filtered = QUOTES

    if category and category.lower() != "all":
        filtered = [q for q in filtered if q.get("category", "").lower() == category.lower()]

    if author:
        filtered = [q for q in filtered if author.lower() in q.get("author", "").lower()]

    if query:
        q_lower = query.lower()
        filtered = [
            q for q in filtered
            if q_lower in q.get("quote", "").lower() or q_lower in q.get("author", "").lower()
        ]

    return jsonify({
        "total": len(filtered),
        "quotes": filtered
    })

@app.route("/api/categories", methods=["GET"])
def get_categories():
    counts = {}
    for q in QUOTES:
        cat = q.get("category", "General")
        counts[cat] = counts.get(cat, 0) + 1

    categories = [{"name": "All", "count": len(QUOTES)}]
    for cat in sorted(counts.keys()):
        categories.append({"name": cat, "count": counts[cat]})

    return jsonify(categories)

@app.route("/api/authors", methods=["GET"])
def get_authors():
    authors = sorted(list({q.get("author") for q in QUOTES if q.get("author")}))
    return jsonify(authors)

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
