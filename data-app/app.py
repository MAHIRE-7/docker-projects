from flask import Flask, request, jsonify, render_template_string
import json
import os
from datetime import datetime

app = Flask(__name__)
DATA_FILE = '/data/logs.json'

def load_logs():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_logs(logs):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w') as f:
        json.dump(logs, f, indent=2)

@app.route('/')
def home():
    logs = load_logs()
    return render_template_string('''
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #007acc; padding-bottom: 10px; }
        .form { margin: 20px 0; }
        input, button { padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 5px; }
        button { background: #007acc; color: white; border: none; cursor: pointer; }
        .log { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .badge { background: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-size: 14px; }
    </style>
    <div class="container">
        <h1>📊 Data Persistence App <span class="badge">Volume Demo</span></h1>
        <p>This app demonstrates Docker volumes by persisting data to <code>/data/logs.json</code></p>
        
        <div class="form">
            <input type="text" id="message" placeholder="Enter a message...">
            <button onclick="addLog()">Add Log</button>
            <button onclick="clearLogs()">Clear All</button>
        </div>
        
        <h3>Logs ({{ logs|length }} entries):</h3>
        {% for log in logs %}
        <div class="log">
            <strong>{{ log.timestamp }}</strong>: {{ log.message }}
        </div>
        {% endfor %}
    </div>
    
    <script>
        function addLog() {
            const message = document.getElementById('message').value;
            if (!message) return;
            
            fetch('/add', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message: message})
            }).then(() => location.reload());
        }
        
        function clearLogs() {
            fetch('/clear', {method: 'POST'}).then(() => location.reload());
        }
    </script>
    ''', logs=logs)

@app.route('/add', methods=['POST'])
def add_log():
    logs = load_logs()
    data = request.get_json()
    logs.append({
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'message': data['message']
    })
    save_logs(logs)
    return jsonify({'success': True})

@app.route('/clear', methods=['POST'])
def clear_logs():
    save_logs([])
    return jsonify({'success': True})

@app.route('/status')
def status():
    return jsonify({
        'data_file': DATA_FILE,
        'file_exists': os.path.exists(DATA_FILE),
        'log_count': len(load_logs())
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)