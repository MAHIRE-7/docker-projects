from flask import Flask, render_template_string

app = Flask(__name__)

style = '''
<style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
    .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #007acc; padding-bottom: 10px; }
    p { color: #666; font-size: 18px; line-height: 1.6; }
    a { display: inline-block; background: #007acc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    a:hover { background: #005a99; }
    .badge { background: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-size: 14px; }
</style>
'''

@app.route('/')
def home():
    return render_template_string(style + '''
    <div class="container">
        <h1>🐳 Flask Web App</h1>
        <p>Hello from Docker! <span class="badge">Running in Container</span></p>
        <p>This is a simple Flask application containerized with Docker.</p>
        <a href="/about">About</a>
        <a href="/status">Status</a>
    </div>
    ''')

@app.route('/about')
def about():
    return render_template_string(style + '''
    <div class="container">
        <h1>📋 About</h1>
        <p>This Flask app demonstrates Docker containerization with Python.</p>
        <p><strong>Features:</strong></p>
        <ul>
            <li>Python Flask web framework</li>
            <li>Docker containerization</li>
            <li>Responsive design</li>
        </ul>
        <a href="/">Home</a>
        <a href="/status">Status</a>
    </div>
    ''')

@app.route('/status')
def status():
    import os
    return render_template_string(style + '''
    <div class="container">
        <h1>⚡ Status</h1>
        <p><strong>Server:</strong> Flask Development Server</p>
        <p><strong>Python Version:</strong> ''' + os.sys.version.split()[0] + '''</p>
        <p><strong>Environment:</strong> Docker Container</p>
        <p class="badge">✅ All Systems Operational</p>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </div>
    ''')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)