// src/pages/ReportPage.jsx
import React, { useState } from "react";
import { FaFileExport, FaFilter } from "react-icons/fa";
import "./ReportPage.css";

const ReportPage = () => {
  const [filters, setFilters] = useState({
    alphabetical: "",
    disciplinary: "",
    department: "",
    year: "",
    section: "",
    grade: "",
    violation: "",
    status: [],
  });

  const [showFilter, setShowFilter] = useState(false);

  const [reports] = useState([
    { id: 1, student: "Juan Dela Cruz", violation: "No Uniform", department: "BSIT", year: "III", status: "Active" },
    { id: 2, student: "Maria Santos", violation: "Bullying", department: "BSBA", year: "II", status: "Pending" },
  ]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => {
      const updatedStatus = prev.status.includes(value)
        ? prev.status.filter((s) => s !== value)
        : [...prev.status, value];
      return { ...prev, status: updatedStatus };
    });
  };

  const filteredReports = reports
    .filter((r) => (filters.department ? r.department === filters.department : true))
    .filter((r) => (filters.year ? r.year === filters.year : true))
    .filter((r) => (filters.violation ? r.violation === filters.violation : true))
    .filter((r) => (filters.status.length > 0 ? filters.status.includes(r.status) : true))
    .sort((a, b) => {
      if (filters.alphabetical === "A-Z") return a.student.localeCompare(b.student);
      if (filters.alphabetical === "Z-A") return b.student.localeCompare(a.student);
      return 0;
    });

  const handleExport = () => {
    const csvContent = [
      ["Student", "Violation", "Department", "Year", "Status"],
      ...filteredReports.map((r) => [r.student, r.violation, r.department, r.year, r.status]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Report Management</h2>
        <div className="report-controls">
          <button className="btn primary" onClick={handleExport}>
            <FaFileExport className="icon" /> Export
          </button>
          <button className="btn secondary" onClick={() => setShowFilter(!showFilter)}>
            <FaFilter className="icon" /> Filter
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div className="filter-dropdown">
          <div className="filter-modal">
            <h3>Filter</h3>

            {/* Alphabetical */}
            <label>
              <input
                type="radio"
                name="alphabetical"
                checked={filters.alphabetical === "A-Z"}
                onChange={() => handleFilterChange("alphabetical", "A-Z")}
              />{" "}
              Filter by A-Z
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="alphabetical"
                checked={filters.alphabetical === "Z-A"}
                onChange={() => handleFilterChange("alphabetical", "Z-A")}
              />{" "}
              Filter by Z-A
            </label>

            {/* Disciplinary */}
            <label>Disciplinary</label>
            <select value={filters.disciplinary} onChange={(e) => handleFilterChange("disciplinary", e.target.value)}>
              <option value="">Select</option>
              <option value="Verbal Warning">Verbal Warning</option>
              <option value="Suspension">Suspension</option>
            </select>

            {/* Department */}
            <label>Department</label>
            <select value={filters.department} onChange={(e) => handleFilterChange("department", e.target.value)}>
              <option value="">Select</option>
              <option value="BSIT">BSIT</option>
              <option value="BSBA">BSBA</option>
            </select>

            {/* Year */}
            <label>Year</label>
            <select value={filters.year} onChange={(e) => handleFilterChange("year", e.target.value)}>
              <option value="">Select</option>
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>

            {/* Section */}
            <label>Section</label>
            <input
              type="text"
              value={filters.section}
              onChange={(e) => handleFilterChange("section", e.target.value)}
              placeholder="Enter section"
            />

            {/* Grade */}
            <label>Grade</label>
            <select value={filters.grade} onChange={(e) => handleFilterChange("grade", e.target.value)}>
              <option value="">Select</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
            </select>

            {/* Violation */}
            <label>Violation</label>
            <select value={filters.violation} onChange={(e) => handleFilterChange("violation", e.target.value)}>
              <option value="">Select</option>
              <option value="No Uniform">No Uniform</option>
              <option value="Bullying">Bullying</option>
            </select>

            {/* Status */}
            <label>Status</label>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={filters.status.includes("Active")}
                  onChange={() => handleStatusChange("Active")}
                />{" "}
                Active
              </label>
              <br />
              <label>
                <input
                  type="checkbox"
                  checked={filters.status.includes("Complied")}
                  onChange={() => handleStatusChange("Complied")}
                />{" "}
                Complied
              </label>
              <br />
              <label>
                <input
                  type="checkbox"
                  checked={filters.status.includes("Pending")}
                  onChange={() => handleStatusChange("Pending")}
                />{" "}
                Pending
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Violation</th>
              <th>Department</th>
              <th>Year</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.student}</td>
                  <td>{report.violation}</td>
                  <td>{report.department}</td>
                  <td>{report.year}</td>
                  <td>{report.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportPage;