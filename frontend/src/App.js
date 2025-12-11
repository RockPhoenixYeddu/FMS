import { useState, useEffect } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [usermail, setUsermail] = useState('');
  const [entries, setEntries] = useState([]);

  // Fetch all entries from backend
  const fetchEntries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/entries');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  useEffect(() => {
    fetchEntries(); // Fetch entries on page load
  }, []);

  // Add new entry
  const addEntry = async () => {
    if (!username || !usermail) return;

    try {
      const response = await fetch('http://localhost:5000/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, usermail }),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setEntries((prev) => [...prev, newEntry]); // Update table
        setUsername('');
        setUsermail('');
      }
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  // Delete entry
  const deleteEntry = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you wish to delete "${name}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/entries/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEntries((prev) => prev.filter((entry) => entry._id !== id));
      } else {
        alert('Error deleting entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Add New Admin</h2>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="email"
          placeholder="User Email"
          value={usermail}
          onChange={(e) => setUsermail(e.target.value)}
          style={{ padding: '5px' }}
        />
      </div>
      <button onClick={addEntry} style={{ padding: '5px 10px', cursor: 'pointer' }}>
        Add Entry
      </button>

      <h3 style={{ marginTop: '30px' }}>Database Reflection</h3>
      <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>S.No.</th>
            <th>Username</th>
            <th>User Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry._id}>
              <td>{index + 1}</td>
              <td>{entry.username}</td>
              <td>{entry.usermail}</td>
              <td>
                <button
                  onClick={() => deleteEntry(entry._id, entry.username)}
                  style={{ cursor: 'pointer', padding: '3px 7px' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
