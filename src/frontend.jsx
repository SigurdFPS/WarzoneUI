import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const API_URL = 'https://1csu9el123.execute-api.us-east-1.amazonaws.com/Prod';
const GUNS_API_URL = `${API_URL}/guns`;
const PERKS_API_URL = `${API_URL}/perks`;
const LOADOUTS_API_URL = `${API_URL}/loadouts`;

const fetchData = async (url) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const LoadoutForm = ({ guns, perks, onSubmit }) => {
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');
  const [perk1, setPerk1] = useState('');
  const [perk2, setPerk2] = useState('');
  const [perk3, setPerk3] = useState('');
  const [perk4, setPerk4] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ primary, secondary, perk1, perk2, perk3, perk4 });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="primary">Primary Weapon:</label>
      <select id="primary" value={primary} onChange={(e) => setPrimary(e.target.value)}>
        {guns.map(gun => <option key={gun.id} value={gun.id}>{gun.name}</option>)}
      </select>

      <label htmlFor="secondary">Secondary Weapon:</label>
      <select id="secondary" value={secondary} onChange={(e) => setSecondary(e.target.value)}>
        {guns.map(gun => <option key={gun.id} value={gun.id}>{gun.name}</option>)}
      </select>

      <label htmlFor="perk1">Perk 1:</label>
      <select id="perk1" value={perk1} onChange={(e) => setPerk1(e.target.value)}>
        {perks.map(perk => <option key={perk.id} value={perk.id}>{perk.name}</option>)}
      </select>

      <label htmlFor="perk2">Perk 2:</label>
      <select id="perk2" value={perk2} onChange={(e) => setPerk2(e.target.value)}>
        {perks.map(perk => <option key={perk.id} value={perk.id}>{perk.name}</option>)}
      </select>

      <label htmlFor="perk3">Perk 3:</label>
      <select id="perk3" value={perk3} onChange={(e) => setPerk3(e.target.value)}>
        {perks.map(perk => <option key={perk.id} value={perk.id}>{perk.name}</option>)}
      </select>

      <label htmlFor="perk4">Perk 4:</label>
      <select id="perk4" value={perk4} onChange={(e) => setPerk4(e.target.value)}>
        {perks.map(perk => <option key={perk.id} value={perk.id}>{perk.name}</option>)}
      </select>

      <button type="submit">Create Loadout</button>
    </form>
  );
};

const LoadoutList = ({ loadouts, onEdit, onDelete }) => (
  <div>
    {loadouts.map(loadout => (
      <div key={loadout.id} className="loadout">
        <h3>Loadout {loadout.id}</h3>
        <p><strong>Primary:</strong> {loadout.primary}</p>
        <p><strong>Secondary:</strong> {loadout.secondary}</p>
        <p><strong>Perks:</strong></p>
        <div className="perks">
          {loadout.perks.map(perk => (
            <span key={perk.id}>
              <img src={perk.image} alt={perk.name} title={perk.name} />
              {perk.name}
            </span>
          ))}
        </div>
        <button onClick={() => onEdit(loadout.id)}>Edit</button>
        <button onClick={() => onDelete(loadout.id)}>Delete</button>
      </div>
    ))}
  </div>
);

const App = () => {
  const [guns, setGuns] = useState([]);
  const [perks, setPerks] = useState([]);
  const [loadouts, setLoadouts] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const gunsData = await fetchData(GUNS_API_URL);
        const perksData = await fetchData(PERKS_API_URL);
        const loadoutsData = await fetchData(LOADOUTS_API_URL);
        setGuns(gunsData);
        setPerks(perksData);
        setLoadouts(loadoutsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  const handleCreateLoadout = async (loadout) => {
    try {
      await fetch(LOADOUTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loadout)
      });
      setLoadouts([...loadouts, loadout]);
    } catch (error) {
      console.error('Error creating loadout:', error);
    }
  };

  const handleEditLoadout = async (id, updatedLoadout) => {
    try {
      await fetch(`${LOADOUTS_API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedLoadout)
      });
      setLoadouts(loadouts.map(loadout => (loadout.id === id ? updatedLoadout : loadout)));
    } catch (error) {
      console.error('Error updating loadout:', error);
    }
  };

  const handleDeleteLoadout = async (id) => {
    try {
      await fetch(`${LOADOUTS_API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setLoadouts(loadouts.filter(loadout => loadout.id !== id));
    } catch (error) {
      console.error('Error deleting loadout:', error);
    }
  };

  return (
    <div>
      <h1>Warzone Loadouts Configuration</h1>
      <LoadoutForm guns={guns} perks={perks} onSubmit={handleCreateLoadout} />
      <LoadoutList loadouts={loadouts} onEdit={handleEditLoadout} onDelete={handleDeleteLoadout} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
