# Wisdom Vault - 100 Famous Quotes Web Application

A web application built with **Python Flask** and **plain Vanilla JavaScript**, featuring a curated collection of 100 timeless quotes from history's greatest minds.

## Features
- **Featured Hero Card**: Generates a random quote instantly with smooth animations.
- **Search by Author & Keywords**: Real-time debounced search across all 100 quotes.
- **Category Filter Pills**: Filter quotes by *Philosophy*, *Science*, *Inspiration*, *Literature*, *Technology*, *Leadership*, *Art*, and *Life*, with real-time quote counts.
- **Clipboard Copy**: One-click copy with toast notifications.
- **Keyboard Shortcuts**:
  - `Space` or `R`: Fetch a new random quote.
  - `Escape`: Clear search filter.

## Project Structure
```text
quotes-app/
├── app.py                # Flask server and REST API endpoints
├── quotes.json           # 100 curated quotes database
├── requirements.txt      # Python dependencies (Flask>=3.0.0)
├── test_app.py           # Automated unit test suite
├── run.bat               # Windows one-click start script
├── templates/
│   └── index.html        # Semantic HTML5 layout
└── static/
    ├── css/
    │   └── style.css     # Modern responsive styling
    └── js/
        └── app.js        # Plain Vanilla JS logic and Fetch API
```

## How to Run

### Option 1: Using the batch script (Windows)
Double-click `run.bat` or run in terminal:
```cmd
run.bat
```

### Option 2: Using the virtual environment directly
```cmd
.venv\Scripts\python.exe app.py
```
Or in PowerShell:
```powershell
& ".\.venv\Scripts\python.exe" app.py
```

Then open your browser and navigate to:
```text
http://127.0.0.1:5000
```

## Running Tests
To run the automated test suite:
```powershell
& ".\.venv\Scripts\python.exe" -m unittest test_app.py
```
