import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

function App() {
  const [entries, setEntries] = useState([]);

  // Dialog UI states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // add | addConfirm | edit | updateConfirm | delete
  const [selectedEntry, setSelectedEntry] = useState(null);

  const fetchEntries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/entries');
      const data = await res.json();
      setEntries(data);
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // ---------- ADD ENTRY ----------
  const openAddDialog = () => {
    setSelectedEntry({ username: '', usermail: '' });
    setDialogType('add');
    setShowDialog(true);
  };

  const confirmAdd = () => {
    setDialogType('addConfirm');
  };

  const handleAdd = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedEntry),
      });

      if (res.ok) {
        const newEntry = await res.json();
        setEntries((prev) => [...prev, newEntry]);
      }
    } catch (e) {
      console.error('Add error:', e);
    }

    setShowDialog(false);
    setDialogType('');
  };

  // ---------- EDIT ENTRY ----------
  const openEditDialog = (entry) => {
    setSelectedEntry({ ...entry });
    setDialogType('edit');
    setShowDialog(true);
  };

  const confirmUpdate = () => {
    setDialogType('updateConfirm');
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/entries/${selectedEntry._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedEntry),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setEntries((prev) =>
          prev.map((e) => (e._id === updated._id ? updated : e))
        );
      }
    } catch (e) {
      console.error('Update error:', e);
    }

    setShowDialog(false);
    setDialogType('');
  };

  // ---------- DELETE ENTRY ----------
  const openDeleteDialog = (entry) => {
    setSelectedEntry(entry);
    setDialogType('delete');
    setShowDialog(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/entries/${selectedEntry._id}`,
        {
          method: 'DELETE',
        }
      );

      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e._id !== selectedEntry._id));
      }
    } catch (e) {
      console.error('Delete error:', e);
    }

    setShowDialog(false);
    setDialogType('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>

      <h2>Admin Dashboard</h2>

      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: 'collapse',
          width: '80%',
          marginBottom: '20px',
        }}
      >
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
                  style={{
                    cursor: 'pointer',
                    marginRight: '12px',
                    color: 'blue',
                  }}
                  onClick={() => openEditDialog(entry)}
                />

                <FaTrash
                  style={{ cursor: 'pointer', color: 'red' }}
                  onClick={() => openDeleteDialog(entry)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* + ADD BUTTON */}
      <div
        style={{
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          background: '#4CAF50',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
        }}
        onClick={openAddDialog}
      >
        <FaPlus style={{ marginRight: '5px' }} /> Add Admin
      </div>

      {/* ============== DIALOG BOX ============== */}
      {showDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '20px',
              width: '350px',
              borderRadius: '10px',
            }}
          >
            {/* ---------- ADD FORM ---------- */}
            {dialogType === 'add' && (
              <>
                <h3>Add New Admin</h3>

                <input
                  type="text"
                  placeholder="Username"
                  value={selectedEntry.username}
                  onChange={(e) =>
                    setSelectedEntry((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  style={{ width: '100%', padding: '6px', marginBottom: '10px' }}
                />

                <input
                  type="email"
                  placeholder="User Email"
                  value={selectedEntry.usermail}
                  onChange={(e) =>
                    setSelectedEntry((prev) => ({
                      ...prev,
                      usermail: e.target.value,
                    }))
                  }
                  style={{ width: '100%', padding: '6px', marginBottom: '10px' }}
                />

                <button
                  onClick={confirmAdd}
                  style={{
                    background: 'green',
                    color: 'white',
                    padding: '6px 10px',
                    marginRight: '10px',
                  }}
                >
                  Add
                </button>

                <button onClick={() => setShowDialog(false)}>Cancel</button>
              </>
            )}

            {/* ---------- ADD CONFIRM ---------- */}
            {dialogType === 'addConfirm' && (
              <>
                <h3>Confirm</h3>
                <p>
                  Add <b>{selectedEntry.username}</b>?
                </p>

                <button
                  onClick={handleAdd}
                  style={{
                    background: 'green',
                    color: 'white',
                    padding: '6px 10px',
                    marginRight: '10px',
                  }}
                >
                  Yes
                </button>

                <button onClick={() => setDialogType('add')}>No</button>
              </>
            )}

            {/* ---------- EDIT FORM ---------- */}
            {dialogType === 'edit' && (
              <>
                <h3>Edit Admin</h3>

                <input
                  type="text"
                  value={selectedEntry.username}
                  onChange={(e) =>
                    setSelectedEntry((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  style={{ width: '100%', padding: '6px', marginBottom: '10px' }}
                />

                <input
                  type="email"
                  value={selectedEntry.usermail}
                  onChange={(e) =>
                    setSelectedEntry((prev) => ({
                      ...prev,
                      usermail: e.target.value,
                    }))
                  }
                  style={{ width: '100%', padding: '6px', marginBottom: '10px' }}
                />

                <button
                  onClick={confirmUpdate}
                  style={{
                    background: 'green',
                    color: 'white',
                    padding: '6px 10px',
                    marginRight: '10px',
                  }}
                >
                  Update
                </button>

                <button onClick={() => setShowDialog(false)}>Cancel</button>
              </>
            )}

            {/* ---------- UPDATE CONFIRM ------- */}
            {dialogType === 'updateConfirm' && (
              <>
                <h3>Confirm Changes</h3>

                <p>
                  Update <b>{selectedEntry.username}</b>?
                </p>

                <button
                  onClick={handleUpdate}
                  style={{
                    background: 'green',
                    color: 'white',
                    padding: '6px 10px',
                    marginRight: '10px',
                  }}
                >
                  Yes
                </button>

                <button onClick={() => setDialogType('edit')}>No</button>
              </>
            )}

            {/* ---------- DELETE ---------- */}
            {dialogType === 'delete' && (
              <>
                <h3>Delete Admin</h3>
                <p>
                  Delete <b>{selectedEntry.username}</b>?
                </p>

                <button
                  onClick={handleDelete}
                  style={{
                    background: 'red',
                    color: 'white',
                    padding: '6px 10px',
                    marginRight: '10px',
                  }}
                >
                  Yes
                </button>

                <button onClick={() => setShowDialog(false)}>No</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
