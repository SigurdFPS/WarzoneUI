from flask import Flask, request, jsonify, redirect
import requests

app = Flask(__name__)

CLIENT_ID = '3kfv655d9opnjgj3wf02t0i05x5v80'
CLIENT_SECRET = 'O0erF/m/23WjogQtCVFnfrtuQS7syaT2HE9SpBEE2DM='
REDIRECT_URI = 'https://3kfv655d9opnjgj3wf02t0i05x5v80.ext-twitch.tv/'

loadouts = {}

@app.route('/create_loadout', methods=['POST'])
def create_loadout():
    data = request.json
    loadout_id = len(loadouts) + 1
    loadouts[loadout_id] = data
    return jsonify({'loadout_id': loadout_id, 'status': 'success'})

@app.route('/update_loadout/<int:loadout_id>', methods=['PUT'])
def update_loadout(loadout_id):
    if loadout_id in loadouts:
        data = request.json
        loadouts[loadout_id] = data
        return jsonify({'status': 'success'})
    return jsonify({'status': 'error', 'message': 'Loadout not found'}), 404

@app.route('/delete_loadout/<int:loadout_id>', methods=['DELETE'])
def delete_loadout(loadout_id):
    if loadout_id in loadouts:
        del loadouts[loadout_id]
        return jsonify({'status': 'success'})
    return jsonify({'status': 'error', 'message': 'Loadout not found'}), 404

@app.route('/get_loadouts', methods=['GET'])
def get_loadouts():
    return jsonify(loadouts)

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
    app.run(debug=True, ssl_context='adhoc')
