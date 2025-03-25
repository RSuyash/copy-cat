from flask import Flask, jsonify
from data_loader import load_gutenberg_data
from data_cleaning import clean_text

app = Flask(__name__)

@app.route('/load_gutenberg')
def load_gutenberg():
    gutenberg_url = "https://www.gutenberg.org/files/2701/2701-h/2701-h.htm"  # Example: Moby Dick
    gutenberg_text = load_gutenberg_data(gutenberg_url)
    if gutenberg_text:
        cleaned_text = clean_text(gutenberg_text)
        if cleaned_text:
            return jsonify({
                "status": "success",
                "message": "Gutenberg data loaded and cleaned",
                "data": cleaned_text[:100] + "..."  # Return a snippet
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to clean Gutenberg text"
            }), 500
    else:
        return jsonify({
            "status": "error",
            "message": "Failed to load Gutenberg text"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=8001)