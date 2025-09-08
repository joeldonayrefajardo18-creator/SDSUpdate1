// src/pages/ViolationPage.jsx
import React, { useState, useRef, useEffect } from "react";
import "./ViolationPage.css";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";

const API_URL = "http://localhost/SDSUpdate1-main/backend/Violation.php"; // change path if needed

export default function ViolationPage() {
  const [violations, setViolations] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [formData, setFormData] = useState({ violation: "", type: "", severity: "" });
  const [editId, setEditId] = useState(null);

  // filter modal states
  const [alphabetical, setAlphabetical] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const filterRef = useRef(null);

  // bulk upload refs / state
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  // ---- FETCH VIOLATIONS ----
  const fetchViolations = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setViolations(data);
      setFilteredViolations(data);
    } catch (err) {
      console.error("Error fetching violations:", err);
    }
  };

  useEffect(() => {
    fetchViolations();
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
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        fetchViolations();
        setFormData({ violation: "", type: "", severity: "" });
        setShowAddModal(false);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Error adding violation:", err);
    }
  };

  // ---- EDIT ----
  const handleEdit = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...formData }),
      });
      const result = await res.json();
      if (result.success) {
        fetchViolations();
        setFormData({ violation: "", type: "", severity: "" });
        setShowEditModal(false);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Error editing violation:", err);
    }
  };

  const openEditModal = (violation) => {
    setEditId(violation.id);
    setFormData({
      violation: violation.violation,
      type: violation.type,
      severity: violation.severity,
    });
    setShowEditModal(true);
  };

  // ---- DELETE ----
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this violation?")) {
      try {
        const res = await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const result = await res.json();
        if (result.success) {
          fetchViolations();
        } else {
          alert(result.message);
        }
      } catch (err) {
        console.error("Error deleting violation:", err);
      }
    }
  };

  // ---- SEARCH ----
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = violations.filter((v) =>
      (v.violation || "").toLowerCase().includes(value)
    );
    setFilteredViolations(filtered);
  };

  // ---- FILTER ----
  const applyFilter = () => {
    let result = [...violations];

    if (alphabetical === "az") {
      result.sort((a, b) => a.violation.localeCompare(b.violation));
    } else if (alphabetical === "za") {
      result.sort((a, b) => b.violation.localeCompare(a.violation));
    }

    if (categoryFilter) {
      result = result.filter((v) => v.type === categoryFilter);
    }

    if (severityFilter) {
      result = result.filter((v) => v.severity === severityFilter);
    }

    setFilteredViolations(result);
    setShowFilterModal(false);
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

  // ---- CSV EXPORT ----
  const exportToCSV = (data = filteredViolations) => {
    if (!data || data.length === 0) {
      alert("No data to export.");
      return;
    }
    const headers = ["Violation", "Type", "Severity"];
    const csvRows = [headers.join(",")];

    data.forEach((r) => {
      const row = [
        (r.violation || "").replace(/"/g, '""'),
        (r.type || "").replace(/"/g, '""'),
        (r.severity || "").replace(/"/g, '""'),
      ].map((cell) => `"${cell}"`);
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\r\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.href = url;
    a.download = `violations_export_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ---- BULK UPLOAD ----
  const handleBulkUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // naive CSV parser that handles quoted commas
  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim() !== "");
    if (lines.length === 0) return [];
    const splitLine = (line) =>
      line.match(/(?:,|\n|^)(?:"([^"]*)"|([^",\n]*))/g).map((cell) =>
        cell.replace(/^(,|^)/, "").replace(/^"/, "").replace(/"$/, "").replace(/""/g, '"')
      );
    // fallback if regex fails
    let headers = [];
    try {
      headers = splitLine(lines[0]).map((h) => h.trim().toLowerCase());
    } catch (e) {
      headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    }
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      let values = [];
      try {
        values = splitLine(lines[i]);
      } catch (e) {
        values = lines[i].split(",");
      }
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = (values[idx] || "").trim().replace(/^"|"$/g, "");
      });
      rows.push(obj);
    }
    return rows;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please upload a CSV file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target.result;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          alert("No rows found in CSV.");
          return;
        }
        // Check required columns (allow different header order)
        const sample = parsed[0];
        const keys = Object.keys(sample).map((k) => k.toLowerCase());
        if (!keys.includes("violation") || !keys.includes("type") || !keys.includes("severity")) {
          alert("CSV must include columns: violation, type, severity (case-insensitive).");
          return;
        }

        setUploadProgress({ current: 0, total: parsed.length });
        // Upload sequentially to backend using POST for each row
        for (let i = 0; i < parsed.length; i++) {
          const row = parsed[i];
          const payload = {
            violation: row.violation || row["Violation"] || row["VIOLATION"] || "",
            type: row.type || row["Type"] || row["TYPE"] || "",
            severity: row.severity || row["Severity"] || row["SEVERITY"] || "",
          };
          // minimal validation
          if (!payload.violation) {
            console.warn(`Skipping row ${i + 1} - missing violation`);
            setUploadProgress({ current: i + 1, total: parsed.length });
            continue;
          }
          try {
            await fetch(API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          } catch (err) {
            console.error("Upload row error:", err);
          }
          setUploadProgress({ current: i + 1, total: parsed.length });
        }
        setUploadProgress(null);
        alert("Bulk upload finished.");
        fetchViolations();
      } catch (err) {
        console.error("Error parsing/uploading CSV:", err);
        alert("Failed to process CSV.");
        setUploadProgress(null);
      }
    };
    reader.onerror = () => {
      alert("Failed to read file.");
    };
    reader.readAsText(file);
  };

  return (
    <div className="violation-container">
      {/* HEADER WITH USER */}
      <div className="violation-header">
        <h2>Violation Management</h2>
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <span className="username">Admin User</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="violation-controls">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={search}
          onChange={handleSearch}
        />
        <div className="button-group">
          <button className="btn primary" onClick={() => setShowAddModal(true)}>+ Add</button>
          <button className="btn secondary" onClick={handleBulkUploadClick}>Bulk Upload</button>
          <button className="btn secondary" onClick={() => exportToCSV(filteredViolations)}>Export</button>
          <button className="btn secondary" onClick={() => setShowFilterModal(true)}>Filter</button>
        </div>
        {uploadProgress && (
          <div style={{ marginLeft: 12 }}>
            Uploading {uploadProgress.current}/{uploadProgress.total}...
          </div>
        )}
      </div>

      {/* hidden file input for bulk upload */}
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* TABLE */}
      <div className="violation-table-container">
        <table className="violation-table">
          <thead>
            <tr>
              <th>Violation</th>
              <th>Type</th>
              <th>Severity Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredViolations.map((v) => (
              <tr key={v.id}>
                <td>{v.violation}</td>
                <td>{v.type}</td>
                <td>{v.severity}</td>
                <td>
                  <FaEdit className="icon edit-icon" onClick={() => openEditModal(v)} />
                  <FaTrash className="icon delete-icon" onClick={() => handleDelete(v.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- ADD MODAL ---- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Add Violation</h3>
            </div>
            <div className="modal-body">
              <label>Violation</label>
              <input
                type="text"
                name="violation"
                value={formData.violation}
                onChange={handleInputChange}
              />
              <label>Category</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="">Select Category</option>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
              </select>
              <label>Severity Level</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
              >
                <option value="">Select Severity</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn cancel" onClick={() => setShowAddModal(false)}>
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
              <h3>Edit Violation</h3>
            </div>
            <div className="modal-body">
              <label>Violation</label>
              <input
                type="text"
                name="violation"
                value={formData.violation}
                onChange={handleInputChange}
              />
              <label>Category</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
              </select>
              <label>Severity Level</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn cancel" onClick={() => setShowEditModal(false)}>
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
                onChange={() => setAlphabetical(alphabetical === "az" ? "" : "az")}
              /> Filter by A-Z
            </div>
            <div>
              <input
                type="checkbox"
                checked={alphabetical === "za"}
                onChange={() => setAlphabetical(alphabetical === "za" ? "" : "za")}
              /> Filter by Z-A
            </div>

            <label>Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All</option>
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
            </select>

            <label>Severity Level</label>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>

            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowFilterModal(false)}>Cancel</button>
              <button className="btn primary" onClick={applyFilter}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating download button bottom-right */}
      <button
        onClick={() => exportToCSV(filteredViolations)}
        title="Download CSV"
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 56,
          height: 56,
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          cursor: "pointer",
          zIndex: 9999,
          fontSize: 14,
        }}
      >
        ↓
      </button>
    </div>
  );
}
