from flask import Flask, request, jsonify, redirect
import requests

app = Flask(__name__)

CLIENT_ID = '3kfv655d9opnjgj3wf02t0i05x5v80'
CLIENT_SECRET = 'O0erF/m/23WjogQtCVFnfrtuQS7syaT2HE9SpBEE2DM='
REDIRECT_URI = 'https://3kfv655d9opnjgj3wf02t0i05x5v80.ext-twitch.tv/'

@app.route('/twitch_auth')
def twitch_auth():
    code = request.args.get('code')
    if not code:
        return 'Missing code', 400
    token_url = 'https://id.twitch.tv/oauth2/token'
    params = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': REDIRECT_URI
    }
    response = requests.post(token_url, params=params)
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True)
