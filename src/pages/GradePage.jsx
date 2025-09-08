// src/pages/GradePage.jsx
import React, { useState, useRef, useEffect } from "react";
import "./GradePage.css";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";

export default function GradePage() {
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [formData, setFormData] = useState({ id: null, grade: "", type: "" });
  const [editId, setEditId] = useState(null);

  // filter modal states
  const [alphabetical, setAlphabetical] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filterRef = useRef(null);

  const API_URL = "http://localhost/SDSUpdate1-main/backend/Grade.php"; // adjust path if needed

  // ---- FETCH ALL ----
  const fetchGrades = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setGrades(data);
      setFilteredGrades(data);
    } catch (err) {
      console.error("Error fetching grades:", err);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  // ---- HANDLE INPUT ----
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---- ADD ----
  const handleAdd = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: formData.grade, type: formData.type }),
      });
      await res.json();
      fetchGrades();
      setFormData({ grade: "", type: "" });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding grade:", err);
    }
  };

  // ---- EDIT ----
  const handleEdit = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          grade: formData.grade,
          type: formData.type,
        }),
      });
      await res.json();
      fetchGrades();
      setFormData({ grade: "", type: "" });
      setEditId(null);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error editing grade:", err);
    }
  };

  const openEditModal = (g) => {
    setEditId(g.id);
    setFormData({ grade: g.grade, type: g.type });
    setShowEditModal(true);
  };

  // ---- DELETE ----
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        const res = await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        await res.json();
        fetchGrades();
      } catch (err) {
        console.error("Error deleting grade:", err);
      }
    }
  };

  // ---- SEARCH ----
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = grades.filter((g) =>
      g.grade.toLowerCase().includes(value)
    );
    setFilteredGrades(filtered);
  };

  // ---- FILTER ----
  const applyFilter = () => {
    let result = [...grades];

    if (alphabetical === "az") {
      result.sort((a, b) => a.grade.localeCompare(b.grade));
    } else if (alphabetical === "za") {
      result.sort((a, b) => b.grade.localeCompare(a.grade));
    }

    if (typeFilter) {
      result = result.filter((g) => g.type === typeFilter);
    }

    setFilteredGrades(result);
    setShowFilterModal(false);
  };

  // ---- EXPORT ----
  const handleExport = () => {
    const csv = [
      ["Grade", "Type"],
      ...grades.map((g) => [g.grade, g.type]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grades.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- BULK UPLOAD (Simulation) ----
  const handleBulkUpload = () => {
    alert("Bulk Upload feature not yet implemented.");
  };

  // ---- DOWNLOAD TEMPLATE ----
  const handleDownloadTemplate = () => {
    const template = "Grade,Type\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grade_template.csv";
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
    <div className="grade-container">
      {/* HEADER WITH USER */}
      <div className="grade-header">
        <h2>Grade Management</h2>
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <span className="username">Admin User</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grade-controls">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={search}
          onChange={handleSearch}
        />
        <div className="button-group">
          <button className="btn primary" onClick={() => setShowAddModal(true)}>
            + Add
          </button>
          <button className="btn secondary" onClick={handleBulkUpload}>
            Bulk Upload
          </button>
          <button className="btn secondary" onClick={handleExport}>
            Export
          </button>
          <button
            className="btn secondary"
            onClick={() => setShowFilterModal(true)}
          >
            Filter
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="grade-table-container">
        <table className="grade-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrades.map((g) => (
              <tr key={g.id}>
                <td>{g.grade}</td>
                <td>{g.type}</td>
                <td>
                  <FaEdit
                    className="icon edit-icon"
                    onClick={() => openEditModal(g)}
                  />
                  <FaTrash
                    className="icon delete-icon"
                    onClick={() => handleDelete(g.id)}
                  />
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
              <h3>Add Grade</h3>
            </div>
            <div className="modal-body">
              <label>Grade</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                placeholder="Enter Grade"
              />
              <label>Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="Enter Type"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn cancel"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className="btn add" onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- EDIT MODAL ---- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Edit Grade</h3>
            </div>
            <div className="modal-body">
              <label>Grade</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                placeholder="Enter Grade"
              />
              <label>Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="Enter Type"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn cancel"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button className="btn add" onClick={handleEdit}>
                Save
              </button>
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
                onChange={() =>
                  setAlphabetical(alphabetical === "az" ? "" : "az")
                }
              />{" "}
              Sort A-Z
            </div>
            <div>
              <input
                type="checkbox"
                checked={alphabetical === "za"}
                onChange={() =>
                  setAlphabetical(alphabetical === "za" ? "" : "za")
                }
              />{" "}
              Sort Z-A
            </div>

            <label>Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Student">Student</option>
            </select>

            <div className="modal-actions">
              <button
                className="btn secondary"
                onClick={() => setShowFilterModal(false)}
              >
                Cancel
              </button>
              <button className="btn primary" onClick={applyFilter}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
