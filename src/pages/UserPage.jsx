// src/pages/UserPage.jsx
import React, { useState, useRef, useEffect } from "react";
import "./UserPage.css";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";

const initialUsers = [];

export default function UserPage() {
  const [users, setUsers] = useState(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [formData, setFormData] = useState({ id: "", username: "", email: "", role: "" });
  const [editIndex, setEditIndex] = useState(null);

  // filter states
  const [alphabetical, setAlphabetical] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const filterRef = useRef(null);

  // ---- FETCH FROM BACKEND ----
  useEffect(() => {
    fetch("http://localhost/SDSUpdatededs-main/backend/user.php")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          setFilteredUsers(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);

  // ---- INPUT HANDLER ----
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---- ADD ----
  const handleAdd = () => {
    fetch("http://localhost/SDSUpdatededs-main/backend/user.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, action: "add" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const newUser = { id: data.id, username: formData.username, email: formData.email, role: formData.role };
          const updated = [...users, newUser];
          setUsers(updated);
          setFilteredUsers(updated);
          setFormData({ id: "", username: "", email: "", role: "" });
          setShowAddModal(false);
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((err) => console.error("Error saving user:", err));
  };

  // ---- EDIT ----
  const handleEdit = () => {
    fetch("http://localhost/SDSUpdatededs-main/backend/user.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, action: "update" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const updated = [...users];
          updated[editIndex] = formData;
          setUsers(updated);
          setFilteredUsers(updated);
          setFormData({ id: "", username: "", email: "", role: "" });
          setShowEditModal(false);
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((err) => console.error("Error updating user:", err));
  };

  const openEditModal = (index) => {
    setEditIndex(index);
    setFormData(users[index]);
    setShowEditModal(true);
  };

  // ---- DELETE ----
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const deletedUser = users[index];

      fetch("http://localhost/SDSUpdatededs-main/backend/user.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletedUser.id, action: "delete" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const updated = users.filter((_, i) => i !== index);
            setUsers(updated);
            setFilteredUsers(updated);
          } else {
            alert("Error: " + data.message);
          }
        })
        .catch((err) => console.error("Error deleting user:", err));
    }
  };

  // ---- SEARCH ----
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = users.filter(
      (u) =>
        u.username.toLowerCase().includes(value) ||
        u.email.toLowerCase().includes(value) ||
        u.role.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
  };

  // ---- FILTER ----
  const applyFilter = () => {
    let result = [...users];

    if (alphabetical === "az") {
      result.sort((a, b) => a.username.localeCompare(b.username));
    } else if (alphabetical === "za") {
      result.sort((a, b) => b.username.localeCompare(a.username));
    }

    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(result);
    setShowFilterModal(false);
  };

  // ---- EXPORT ----
  const handleExport = () => {
    const csv = [
      ["Username", "Email", "Role"],
      ...users.map((u) => [u.username, u.email, u.role]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- DOWNLOAD TEMPLATE ----
  const handleDownloadTemplate = () => {
    const template = "Username,Email,Role\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- CLOSE FILTER ON OUTSIDE CLICK ----
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterModal(false);
      }
    };

    if (showFilterModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterModal]);

  return (
    <div className="user-container">
      {/* HEADER WITH USER */}
      <div className="user-header">
        <h2>User Management</h2>
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <span className="username">Admin User</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="user-controls">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={search}
          onChange={handleSearch}
        />
        <div className="button-group">
          <button className="btn primary" onClick={() => setShowAddModal(true)}>+ Add</button>
          <button className="btn secondary" onClick={handleExport}>Export</button>
          <button className="btn secondary" onClick={() => setShowFilterModal(true)}>Filter</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, i) => (
              <tr key={i}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <FaEdit className="icon edit-icon" onClick={() => openEditModal(i)} />
                  <FaTrash className="icon delete-icon" onClick={() => handleDelete(i)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="download-template">
        <button className="btn download" onClick={handleDownloadTemplate}>
          Download Template
        </button>
      </div>

      {/* ---- ADD MODAL ---- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Add User</h3>
            </div>
            <div className="modal-body">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter Username"
              />
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter Email"
              />
              <label>Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="Enter Role"
              />
            </div>
            <div className="modal-footer">
              <button className="btn cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn add" onClick={handleAdd}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- EDIT MODAL ---- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Edit User</h3>
            </div>
            <div className="modal-body">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter Username"
              />
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter Email"
              />
              <label>Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="Enter Role"
              />
            </div>
            <div className="modal-footer">
              <button className="btn cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn add" onClick={handleEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- FILTER MODAL ---- */}
      {showFilterModal && (
        <div className="filter-dropdown" ref={filterRef}>
          <div className="filter-modal">
            <h3>Filter</h3>
            <label>Alphabetical</label>
            <div>
              <input
                type="checkbox"
                checked={alphabetical === "az"}
                onChange={() => setAlphabetical(alphabetical === "az" ? "" : "az")}
              /> Sort A-Z
            </div>
            <div>
              <input
                type="checkbox"
                checked={alphabetical === "za"}
                onChange={() => setAlphabetical(alphabetical === "za" ? "" : "za")}
              /> Sort Z-A
            </div>

            <label>Role</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All</option>
              <option value="OSA">OSA</option>
              <option value="Guidance">Guidance</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>

            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowFilterModal(false)}>Cancel</button>
              <button className="btn primary" onClick={applyFilter}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
