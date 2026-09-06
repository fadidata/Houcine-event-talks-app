# Wisdom Vault — 100 Famous Quotes Web Application

[![Python](https://img.shields.io/badge/Python-3.13%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1%2B-black.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6%2B-yellow.svg?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tests](https://img.shields.io/badge/Tests-9%20Passing-success.svg)](#running-tests)
[![Repository](https://img.shields.io/badge/GitHub-Houcine--event--talks--app-181717?logo=github)](https://github.com/fadidata/Houcine-event-talks-app)

An interactive, responsive web application built with **Python Flask** and **plain Vanilla JavaScript**, featuring a curated collection of **100 timeless quotes** from history's greatest philosophers, scientists, authors, and visionaries.

---

## ✨ Key Features

- 🎲 **Featured Random Quote**: Displays an inspiring quote on load and generates new quotes on demand with smooth fade animations.
- 🔍 **Live Debounced Search**: Instant search by **author** (e.g. *Albert Einstein*, *Alan Turing*, *Steve Jobs*, *Mark Twain*) or by quote **keyword**.
- 🏷️ **Category Filter Pills**: Filter quotes by topic with live quote counters:
  - *Philosophy* (17)
  - *Inspiration* (18)
  - *Science* (12)
  - *Literature* (15)
  - *Technology* (10)
  - *Leadership* (10)
  - *Life* (10)
  - *Art* (8)
- 📋 **One-Click Clipboard Copy**: Copy quotes with proper attribution and instant toast notification feedback.
- ⌨️ **Keyboard Navigation**:
  - <kbd>Space</kbd> or <kbd>R</kbd>: Generate a new random quote.
  - <kbd>Esc</kbd>: Clear active search query.
- 📱 **Fully Responsive UI**: Clean modern dark aesthetic optimized for both desktop and mobile viewports.
- ⚡ **Zero Heavy Dependencies**: Pure standard library Python + Flask, no frontend build pipelines or bulky JS frameworks.

---

## 🏗️ Architecture & Project Structure

```text
Houcine-event-talks-app/
├── README.md                     # Root project documentation
├── .gitignore                    # Git ignore configuration
├── news.txt                      # Global & tech news briefing
├── news_summary.txt              # Executive summary of news
└── quotes-app/                   # Main web application package
    ├── app.py                    # Flask server & REST API endpoints
    ├── quotes.json               # Database of 100 curated quotes
    ├── requirements.txt          # Python dependencies (Flask>=3.0.0)
    ├── test_app.py               # Automated unit test suite (9 tests)
    ├── run.bat                   # 1-click Windows startup script
    ├── README.md                 # Application-specific guide
    ├── templates/
    │   └── index.html            # Semantic HTML5 frontend layout
    └── static/
        ├── css/
        │   └── style.css         # Modern dark theme styles & CSS grid
        └── js/
            └── app.js            # Plain Vanilla JS logic, Fetch API & state
```

---

## 🚀 Quick Start

### Prerequisites
- [Python 3.10+](https://www.python.org/downloads/) installed on your system.

### Option A: 1-Click Launch (Windows)
Navigate into `quotes-app` and double-click or run:
```cmd
cd quotes-app
run.bat
```

### Option B: Manual Setup

1. **Navigate to the app directory**:
   ```bash
   cd quotes-app
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv .venv
   ```

3. **Activate the environment**:
   - **Windows (Command Prompt)**:
     ```cmd
     .venv\Scripts\activate.bat
     ```
   - **Windows (PowerShell)**:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source .venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the Flask server**:
   ```bash
   python app.py
   ```

6. **Open your browser**:
   Navigate to **[http://127.0.0.1:5000](http://127.0.0.1:5000)**.

---

## 📡 REST API Reference

The Flask backend exposes clean JSON endpoints for integration:

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | — | Renders the web application interface |
| `GET` | `/api/quote/random` | `category` *(optional)* | Returns a random quote (optionally scoped to a category) |
| `GET` | `/api/quotes` | `q`, `author`, `category` | Multi-criteria search and filter across all quotes |
| `GET` | `/api/categories` | — | Returns all unique categories and their total quote counts |
| `GET` | `/api/authors` | — | Returns a sorted list of unique authors |

### Example API Request & Response
```bash
curl http://127.0.0.1:5000/api/quote/random?category=Science
```

```json
{
  "id": 16,
  "quote": "We can only see a short distance ahead, but we can see plenty there that needs to be done.",
  "author": "Alan Turing",
  "category": "Technology"
}
```

---

## 🧪 Running Tests

The application includes an automated unit test suite covering dataset validation and all API endpoints:

```bash
cd quotes-app
python -m unittest test_app.py
```

### Test Coverage:
- `test_quotes_dataset`: Validates that all 100 quotes have non-empty `id`, `quote`, `author`, and `category` fields.
- `test_index_page`: Checks HTML layout delivery and static asset references.
- `test_random_quote_api`: Verifies random quote payload structure.
- `test_random_quote_with_category`: Validates category-restricted quote selection.
- `test_categories_api`: Verifies category aggregation and count calculations.
- `test_authors_api`: Ensures unique author list generation.
- `test_filter_by_author`: Tests author substring filtering (e.g., `"Einstein"`).
- `test_filter_by_category`: Tests exact category filtering (e.g., `"Philosophy"`).
- `test_search_query`: Tests cross-field keyword searching.

---

## 👤 Author & Repository

- **Author**: Houcine ([@fadidata](https://github.com/fadidata))
- **Repository**: [https://github.com/fadidata/Houcine-event-talks-app](https://github.com/fadidata/Houcine-event-talks-app)
