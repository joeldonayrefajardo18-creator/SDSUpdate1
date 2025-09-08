import React, { useState, useRef, useEffect } from "react";
import "./DepartmentPage.css";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";

export default function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [formData, setFormData] = useState({ id: null, department: "", type: "" });
  const [editId, setEditId] = useState(null);

  // filter modal states
  const [alphabetical, setAlphabetical] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filterRef = useRef(null);

  const API_URL = "http://localhost/SDSUpdate1-main/backend/Department.php"; // adjust path if needed

  // ---- FETCH ALL ----
  const fetchDepartments = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setDepartments(data);
      setFilteredDepartments(data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  useEffect(() => {
    fetchDepartments();
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
        body: JSON.stringify({ department: formData.department, type: formData.type }),
      });
      await res.json();
      fetchDepartments();
      setFormData({ department: "", type: "" });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding department:", err);
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
          department: formData.department,
          type: formData.type,
        }),
      });
      await res.json();
      fetchDepartments();
      setFormData({ department: "", type: "" });
      setEditId(null);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error editing department:", err);
    }
  };

  const openEditModal = (d) => {
    setEditId(d.id);
    setFormData({ department: d.department, type: d.type });
    setShowEditModal(true);
  };

  // ---- DELETE ----
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        const res = await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        await res.json();
        fetchDepartments();
      } catch (err) {
        console.error("Error deleting department:", err);
      }
    }
  };

  // ---- SEARCH ----
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = departments.filter((d) =>
      d.department.toLowerCase().includes(value)
    );
    setFilteredDepartments(filtered);
  };

  // ---- FILTER ----
  const applyFilter = () => {
    let result = [...departments];

    if (alphabetical === "az") {
      result.sort((a, b) => a.department.localeCompare(b.department));
    } else if (alphabetical === "za") {
      result.sort((a, b) => b.department.localeCompare(a.department));
    }

    if (typeFilter) {
      result = result.filter((d) => d.type === typeFilter);
    }

    setFilteredDepartments(result);
    setShowFilterModal(false);
  };

  // ---- EXPORT ----
  const handleExport = () => {
    const csv = [
      ["Department", "Type"],
      ...departments.map((d) => [d.department, d.type]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "departments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- BULK UPLOAD (Simulation) ----
  const handleBulkUpload = () => {
    alert("Bulk Upload feature not yet implemented.");
  };

  // ---- DOWNLOAD TEMPLATE ----
  const handleDownloadTemplate = () => {
    const template = "Department,Type\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "department_template.csv";
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
    <div className="department-container">
      {/* HEADER WITH USER */}
      <div className="department-header">
        <h2>Department Management</h2>
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <span className="username">Admin User</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="department-controls">
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
      <div className="department-table-container">
        <table className="department-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((d) => (
              <tr key={d.id}>
                <td>{d.department}</td>
                <td>{d.type}</td>
                <td>
                  <FaEdit
                    className="icon edit-icon"
                    onClick={() => openEditModal(d)}
                  />
                  <FaTrash
                    className="icon delete-icon"
                    onClick={() => handleDelete(d.id)}
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
              <h3>Add Department</h3>
            </div>
            <div className="modal-body">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Enter Department"
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
              <h3>Edit Department</h3>
            </div>
            <div className="modal-body">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Enter Department"
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
              <option value="Academic">Academic</option>
              <option value="Non-Academic">Non-Academic</option>
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
