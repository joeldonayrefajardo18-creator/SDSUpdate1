import React, { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentIncidentPage.css";

const API_URL = "http://localhost/SDSUpdate1-main/backend/Student.php"; 
const GRADE_URL = "http://localhost/SDSUpdate1-main/backend/Grade.php";
const SECTION_URL = "http://localhost/SDSUpdate1-main/backend/Section.php";
const STRAND_URL = "http://localhost/SDSUpdate1-main/backend/Strand.php";
const DEPARTMENT_URL = "http://localhost/SDSUpdate1-main/backend/Department.php";

export default function StudentIncidentPage() {
  const [students, setStudents] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [filterAZ, setFilterAZ] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const fileInputRef = useRef(null);
  const filterRef = useRef(null);
  const navigate = useNavigate();

  // Dropdown data
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [strands, setStrands] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Fetch students on load
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // Fetch dropdown data
  useEffect(() => {
    fetch(GRADE_URL)
      .then((res) => res.json())
      .then((data) => setGrades(data))
      .catch((err) => console.error("Grade fetch error:", err));

    fetch(SECTION_URL)
      .then((res) => res.json())
      .then((data) => setSections(data))
      .catch((err) => console.error("Section fetch error:", err));

    fetch(STRAND_URL)
      .then((res) => res.json())
      .then((data) => setStrands(data))
      .catch((err) => console.error("Strand fetch error:", err));

    fetch(DEPARTMENT_URL)
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Department fetch error:", err));
  }, []);

  // Close filter if clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add Student (POST)
  const handleAddStudent = (e) => {
    e.preventDefault();
    const form = e.target;
    const newStudent = {
      name: form.name.value,
      email: form.email.value,
      student_id: form.id.value,
      department: form.department?.value || "",
      year: form.year?.value || "",
      grade: form.grade?.value || "",
      section: form.section?.value || "",
      strand: form.strand?.value || "",
      level: selectedLevel,
      status: "Active",
    };

    fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newStudent),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      setStudents([...students, data.student]); // ✅ append galing backend
      setShowAddModal(false);
      setSelectedLevel("");
    } else {
      alert("Error adding student: " + data.error);
    }
  })
  .catch((err) => console.error("Add error:", err));

  };

  // Edit Student (PUT)
  const handleEditStudent = (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedStudent = {
      ...selectedStudent,
      name: form.name.value,
      email: form.email.value,
      id: form.id.value,
      department: form.department?.value || "",
      year: form.year?.value || "",
      grade: form.grade?.value || "",
      section: form.section?.value || "",
      strand: form.strand?.value || "",
      status: form.status.value,
    };

    fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedStudent),
    })
      .then((res) => res.json())
      .then(() => {
        setStudents((prev) =>
          prev.map((s) => (s.id === selectedStudent.id ? updatedStudent : s))
        );
        setShowEditModal(false);
        setSelectedStudent(null);
      })
      .catch((err) => console.error("Edit error:", err));
  };

  // Delete Student (DELETE)
  const handleDeleteStudent = (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    fetch(`${API_URL}?id=${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        setStudents(students.filter((s) => s.id !== id));
        setShowViewModal(false);
      })
      .catch((err) => console.error("Delete error:", err));
  };

  // Bulk upload
  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File "${file.name}" uploaded! (Add processing logic)`);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Name", "ID", "Department", "Year"],
      ...students.map((s) => [s.name, s.id, s.department, s.year]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
  };

  const handleDownloadTemplate = () => {
    const csv = "Name,ID,Department,Section,Grade,Strand,Year\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template.csv";
    a.click();
  };

  const goToIncidentPage = (student) => {
    navigate("/incident", { state: { student } });
  };

  // 🔍 Filtering
  const filteredStudents = useMemo(() => {
    let data = [...students];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.year.toLowerCase().includes(q)
      );
    }

    if (filterDepartment) {
      data = data.filter((s) => s.department === filterDepartment);
    }
    if (filterYear) {
      data = data.filter((s) => s.year === filterYear);
    }
    if (filterAZ === "asc") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filterAZ === "desc") {
      data.sort((a, b) => b.name.localeCompare(a.name));
    }
    return data;
  }, [students, filterAZ, filterDepartment, filterYear, searchTerm]);

  // Render fields
  const renderFields = (level, student = {}) => {
    switch (level) {
      case "junior":
        return (
          <>
            <label>ID*</label>
            <input name="id" defaultValue={student.id} required />

            <label>Grade*</label>
            <select name="grade" defaultValue={student.grade} required>
  <option value="">Select Grade</option>
  {grades.map((g) => (
    <option key={g.id} value={g.grade}>
      {g.grade}
    </option>
  ))}
</select>


            <label>Section*</label>
            <select name="section" defaultValue={student.section} required>
  <option value="">Select Section</option>
  {sections.map((s) => (
    <option key={s.id} value={s.section}>
      {s.section}
    </option>
  ))}
</select> 
          </>
        );

      case "senior":
        return (
          <>
            <label>ID*</label>
            <input name="id" defaultValue={student.id} required />

            <label>Grade*</label>
            <select name="grade" defaultValue={student.grade} required>
  <option value="">Select Grade</option>
  {grades.map((g) => (
    <option key={g.id} value={g.grade}>
      {g.grade}
    </option>
  ))}
</select>


            <label>Section*</label>
            <select name="section" defaultValue={student.section} required>
  <option value="">Select Section</option>
  {sections.map((s) => (
    <option key={s.id} value={s.section}>
      {s.section}
    </option>
  ))}
</select>

            <label>Strand*</label>
            <select name="strand" defaultValue={student.strand} required>
  <option value="">Select Strand</option>
  {strands.map((st) => (
    <option key={st.id} value={st.strand}>
      {st.strand}
    </option>
  ))}
</select>
          </>
        );

      case "college":
        return (
          <>
            <label>ID*</label>
            <input name="id" defaultValue={student.id} required />

            <label>Department*</label>
            <select name="department" defaultValue={student.department} required>
  <option value="">Select Department</option>
  {departments.map((d) => (
    <option key={d.id} value={d.department}>
      {d.department}
    </option>
  ))}
</select>

            <label>Year*</label>
            <select name="year" defaultValue={student.year} required>
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-bar">
        <h1 className="dashboard-title">Student Management</h1>
        <div className="user-account">
          <img src="/RCCLOGO.png" alt="Rcc Logo" className="account-logo" />
          <span className="account-name">OSA</span>
          <span className="dropdown-icon">▾</span>
        </div>
      </div>

      {/* Search + Buttons */}
      <div className="top-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="top-buttons" ref={filterRef}>
          <button className="btn add" onClick={() => setShowAddModal(true)}>
            + Add
          </button>
          <button
            className="btn bulk"
            onClick={() => fileInputRef.current.click()}
          >
            Bulk Upload
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleBulkUpload}
          />
          <button className="btn export" onClick={handleExport}>
            Export
          </button>
          <button
            className="btn filter"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filter
          </button>
          {filterOpen && (
            <div className="filter-dropdown">
              <h3 className="filter-title">Filter</h3>
              {/* A-Z */}
              <div className="filter-section">
                <label className="filter-section-title">Alphabetical</label>
                <div className="filter-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={filterAZ === "asc"}
                      onChange={() =>
                        setFilterAZ(filterAZ === "asc" ? null : "asc")
                      }
                    />{" "}
                    Filter by A–Z
                  </label>
                </div>
                <div className="filter-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={filterAZ === "desc"}
                      onChange={() =>
                        setFilterAZ(filterAZ === "desc" ? null : "desc")
                      }
                    />{" "}
                    Filter by Z–A
                  </label>
                </div>
              </div>
              {/* Department */}
              <div className="filter-section">
                <label className="filter-section-title">Department</label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Year */}
              <div className="filter-section">
                <label className="filter-section-title">Year Level</label>
                <div className="year-radio-group">
                  {["1st Year", "2nd Year", "3rd Year", "4th Year", ""].map(
                    (yr, i) => (
                      <label key={i}>
                        <input
                          type="radio"
                          name="year"
                          value={yr}
                          checked={filterYear === yr}
                          onChange={(e) => setFilterYear(e.target.value)}
                        />{" "}
                        {yr || "All"}
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Department</th>
            <th>Section</th>
            <th>Grade</th>
            <th>Strand</th>
            <th>Year</th>
            <th>Action</th>
            <th>Incident</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((s, idx) => (
            <tr key={idx}>
              <td>{s.name}</td>
              <td>{s.id}</td>
              <td>{s.department || "-"}</td>
              <td>{s.section || "-"}</td>
              <td>{s.grade || "-"}</td>
              <td>{s.strand || "-"}</td>
              <td>{s.year || "-"}</td>
              <td>
                <button
                  className="btn view"
                  onClick={() => {
                    setSelectedStudent(s);
                    setShowViewModal(true);
                  }}
                >
                  View
                </button>
              </td>
              <td>
                <button
                  className="btn configure"
                  onClick={() => goToIncidentPage(s)}
                >
                  Configure
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Download Template */}
      <div className="download-template">
        <button onClick={handleDownloadTemplate}>Download Template</button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-display">
            <h3>Add Student</h3>
            <form onSubmit={handleAddStudent} className="add-student-form">
              <label>
                Name<span className="required">*</span>
              </label>
              <input name="name" required />

              <label>
                Email<span className="required">*</span>
              </label>
              <input name="email" type="email" required />

              {/* Radio Buttons */}
              <div className="radio-group-horizontal">
                {["junior", "senior", "college"].map((lvl) => (
                  <label key={lvl} className="radio-option">
                    <input
                      type="radio"
                      name="level"
                      value={lvl}
                      checked={selectedLevel === lvl}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      required
                    />
                    {lvl === "junior"
                      ? "Junior High School"
                      : lvl === "senior"
                      ? "Senior High School"
                      : "College"}
                  </label>
                ))}
              </div>

              {renderFields(selectedLevel)}

              <div className="button-row">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedStudent && (
        <div className="modal">
          <div className="modal-content">
            <h3>View Student</h3>
            <div className="view-details">
              <p>
                <b>Name:</b> {selectedStudent.name}
              </p>
              <p>
                <b>Email:</b> {selectedStudent.email || "N/A"}
              </p>
              <p>
                <b>Student ID:</b> {selectedStudent.id}
              </p>
              <p>
                <b>Department:</b> {selectedStudent.department}
              </p>
              <p>
                <b>Section:</b> {selectedStudent.section}
              </p>
              <p>
                <b>Grade:</b> {selectedStudent.grade}
              </p>
              <p>
                <b>Strand:</b> {selectedStudent.strand}
              </p>
              <p>
                <b>Year:</b> {selectedStudent.year}
              </p>

              {renderFields(selectedStudent.level, selectedStudent)}

              <p>
                <b>Status:</b> {selectedStudent.status || "Active"}
              </p>
            </div>
            <div className="modal-actions bottom-right">
              <button
                className="btn close"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button
                className="btn edit"
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
              >
                Edit
              </button>
              <button
                className="btn delete"
                onClick={() => handleDeleteStudent(selectedStudent.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStudent && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Student</h3>
            <form onSubmit={handleEditStudent}>
              <label>Name*</label>
              <input
                name="name"
                defaultValue={selectedStudent.name}
                required
              />

              <label>Email*</label>
              <input
                name="email"
                type="email"
                defaultValue={selectedStudent.email || ""}
                required
              />

              {renderFields(selectedStudent.level, selectedStudent)}

              <label>Status*</label>
              <select
                name="status"
                defaultValue={selectedStudent.status || "Active"}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="button-row">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 