import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa'; // icons

function App() {
  const [username, setUsername] = useState('');
  const [usermail, setUsermail] = useState('');
  const [entries, setEntries] = useState([]);

  // UI States
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'delete' or 'edit' or 'confirmUpdate'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch entries from backend
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
    fetchEntries();
  }, []);

  // Add entry
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
        setEntries((prev) => [...prev, newEntry]);
        setUsername('');
        setUsermail('');
        setMessage(`${newEntry.username} has been added`);
      }
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  // Open dialog
  const openDialog = (type, entry) => {
    setDialogType(type);
    setSelectedEntry(entry);
    setShowDialog(true);
  };

  // Delete entry
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/entries/${selectedEntry._id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEntries((prev) => prev.filter((e) => e._id !== selectedEntry._id));
        setMessage(`${selectedEntry.username} has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
    setShowDialog(false);
  };

  // Open confirm update dialog
  const confirmUpdate = () => {
    setDialogType('confirmUpdate');
  };

  // Update entry
  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/entries/${selectedEntry._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: selectedEntry.username,
          usermail: selectedEntry.usermail,
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        setEntries((prev) =>
          prev.map((e) => (e._id === updated._id ? updated : e))
        );
        setMessage(`${updated.username} has been updated`);
      }
    } catch (error) {
      console.error('Error updating:', error);
    }
    setDialogType('');
    setShowDialog(false);
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

      <button onClick={addEntry} style={{ padding: '5px 10px' }}>Add Entry</button>

      {message && (
        <p style={{ marginTop: '15px', color: 'green', fontWeight: 'bold' }}>{message}</p>
      )}

      <h3 style={{ marginTop: '30px' }}>Database Reflection</h3>

      <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '80%' }}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Username</th>
            <th>User Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry._id}>
              <td>{index + 1}</td>
              <td>{entry.username}</td>
              <td>{entry.usermail}</td>
              <td>
                <FaEdit
                  style={{ cursor: 'pointer', marginRight: '10px', color: 'blue' }}
                  onClick={() => openDialog('edit', { ...entry })}
                />
                <FaTrash
                  style={{ cursor: 'pointer', color: 'red' }}
                  onClick={() => openDialog('delete', entry)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* -------------------- Dialog Box -------------------- */}
      {showDialog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'white', padding: '20px', width: '350px', borderRadius: '10px' }}>

            {/* Delete Dialog */}
            {dialogType === 'delete' && (
              <>
                <h3>Delete Entry</h3>
                <p>Are you sure you want to delete <b>{selectedEntry.username}</b>?</p>
                <button
                  onClick={handleDelete}
                  style={{ background: 'red', color: 'white', marginRight: '10px', padding: '5px 10px' }}
                >Yes</button>
                <button onClick={() => setShowDialog(false)}>No</button>
              </>
            )}

            {/* Edit Dialog */}
            {dialogType === 'edit' && (
              <>
                <h3>Edit Entry</h3>
                <input
                  type="text"
                  value={selectedEntry.username}
                  onChange={(e) => setSelectedEntry(prev => ({ ...prev, username: e.target.value }))}
                  style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
                />
                <input
                  type="text"
                  value={selectedEntry.usermail}
                  onChange={(e) => setSelectedEntry(prev => ({ ...prev, usermail: e.target.value }))}
                  style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
                />
                <button
                  onClick={confirmUpdate}
                  style={{ background: 'green', color: 'white', marginRight: '10px', padding: '5px 10px' }}
                >Update</button>
                <button onClick={() => setShowDialog(false)}>Cancel</button>
              </>
            )}

            {/* Confirm Update Dialog */}
            {dialogType === 'confirmUpdate' && (
              <>
                <h3>Confirm Changes</h3>
                <p>Are you sure you want to update <b>{selectedEntry.username}</b>?</p>
                <button
                  onClick={handleUpdate}
                  style={{ background: 'green', color: 'white', marginRight: '10px', padding: '5px 10px' }}
                >Yes</button>
                <button
                  onClick={() => setDialogType('edit')}
                  style={{ padding: '5px 10px' }}
                >No</button>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
