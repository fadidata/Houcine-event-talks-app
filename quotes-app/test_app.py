import json
import unittest
from app import app, QUOTES

class QuotesAppTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_quotes_dataset(self):
        """Verify the dataset contains exactly 100 valid quotes."""
        self.assertEqual(len(QUOTES), 100, "Dataset must contain exactly 100 quotes.")
        ids = set()
        for q in QUOTES:
            self.assertIn("id", q)
            self.assertIn("quote", q)
            self.assertIn("author", q)
            self.assertIn("category", q)
            self.assertTrue(len(q["quote"].strip()) > 0)
            self.assertTrue(len(q["author"].strip()) > 0)
            self.assertTrue(len(q["category"].strip()) > 0)
            ids.add(q["id"])
        self.assertEqual(len(ids), 100, "All quote IDs should be unique.")

    def test_index_page(self):
        """Test GET / renders HTML successfully."""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Wisdom Vault", response.data)
        self.assertIn(b"app.js", response.data)

    def test_random_quote_api(self):
        """Test GET /api/quote/random returns a valid quote."""
        response = self.app.get('/api/quote/random')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("quote", data)
        self.assertIn("author", data)
        self.assertIn("category", data)

    def test_random_quote_with_category(self):
        """Test GET /api/quote/random?category=Science returns a science quote."""
        response = self.app.get('/api/quote/random?category=Science')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["category"], "Science")

    def test_categories_api(self):
        """Test GET /api/categories returns category statistics."""
        response = self.app.get('/api/categories')
        self.assertEqual(response.status_code, 200)
        categories = response.get_json()
        self.assertTrue(len(categories) > 1)
        # First entry should be "All" with count 100
        all_cat = next(c for c in categories if c["name"] == "All")
        self.assertEqual(all_cat["count"], 100)

    def test_authors_api(self):
        """Test GET /api/authors returns a list of unique authors."""
        response = self.app.get('/api/authors')
        self.assertEqual(response.status_code, 200)
        authors = response.get_json()
        self.assertTrue(len(authors) > 0)
        self.assertIn("Albert Einstein", authors)

    def test_filter_by_author(self):
        """Test GET /api/quotes?author=Einstein filters by author name."""
        response = self.app.get('/api/quotes?author=Einstein')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["total"] > 0)
        for q in data["quotes"]:
            self.assertIn("einstein", q["author"].lower())

    def test_filter_by_category(self):
        """Test GET /api/quotes?category=Philosophy filters by category."""
        response = self.app.get('/api/quotes?category=Philosophy')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["total"] > 0)
        for q in data["quotes"]:
            self.assertEqual(q["category"].lower(), "philosophy")

    def test_search_query(self):
        """Test GET /api/quotes?q=imagination matches quote text."""
        response = self.app.get('/api/quotes?q=imagination')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["total"] > 0)
        for q in data["quotes"]:
            matched = "imagination" in q["quote"].lower() or "imagination" in q["author"].lower()
            self.assertTrue(matched)

if __name__ == "__main__":
    unittest.main()
