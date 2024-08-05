from flask import Flask, request, jsonify
import json

app = Flask(WarzoneUI)

# In-memory storage for loadouts
loadouts = {}

@app.route('/create_loadout', methods=['POST'])
def create_loadout():
    data = request.json
    loadout_id = len(loadouts) + 1
    loadouts[loadout_id] = data
    return jsonify({'loadout_id': loadout_id, 'status': 'success'})

@app.route('/get_loadouts', methods=['GET'])
def get_loadouts():
    return jsonify(loadouts)

if __name__ == '__main__':
    app.run(debug=True)
