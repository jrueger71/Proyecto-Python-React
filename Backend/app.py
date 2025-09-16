# app.py
from flask import Flask, jsonify
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)
# Enable CORS to allow requests from the React frontend
CORS(app)

@app.route('/api/status', methods=['GET'])
def get_status():
    """
    Returns a simple JSON response to test the backend status.
    """
    data = {
        "message": "¡El backend de Python está funcionando correctamente!",
        "status": "success"
    }
    return jsonify(data)

if __name__ == '__main__':
    # Run the application in debug mode for development
    # It will be accessible at http://127.0.0.1:5000
    app.run(debug=True, port=5000)
