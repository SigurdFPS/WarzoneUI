import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [loadouts, setLoadouts] = useState([]);
  const [newLoadout, setNewLoadout] = useState({ primary: '', secondary: '', perks: '' });

  useEffect(() => {
    axios.get('/get_loadouts')
      .then(response => setLoadouts(response.data));
  }, []);

  const handleCreateLoadout = () => {
    axios.post('/create_loadout', newLoadout)
      .then(response => {
        setLoadouts([...loadouts, response.data]);
        setNewLoadout({ primary: '', secondary: '', perks: '' });
      });
  };

  return (
    <div>
      <h1>Warzone Loadouts</h1>
      <input type="text" placeholder="Primary" value={newLoadout.primary} onChange={e => setNewLoadout({ ...newLoadout, primary: e.target.value })} />
      <input type="text" placeholder="Secondary" value={newLoadout.secondary} onChange={e => setNewLoadout({ ...newLoadout, secondary: e.target.value })} />
      <input type="text" placeholder="Perks" value={newLoadout.perks} onChange={e => setNewLoadout({ ...newLoadout, perks: e.target.value })} />
      <button onClick={handleCreateLoadout}>Create Loadout</button>
      <ul>
        {loadouts.map(loadout => (
          <li key={loadout.loadout_id}>{loadout.primary} / {loadout.secondary} / {loadout.perks}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
