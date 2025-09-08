import React, { useState } from "react";
import "./DashboardPage.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

function DashboardPage() {
  const [sanctionData] = useState([
    { name: "Verbal Warning", value: 5, className: "verbal" },
    { name: "Written Warning", value: 2, className: "written" },
    { name: "Suspension", value: 10, className: "suspension" },
  ]);

  const [violationByDept] = useState([
    { department: "BSIT", violations: 0 },
    { department: "BEED", violations: 0 },
    { department: "BSHM", violations: 0 },
    { department: "BSCE", violations: 0 },
    { department: "Grade 12", violations: 0 },
    { department: "Grade 8", violations: 0 },
    { department: "Grade 9", violations: 0 },
  ]);

  const [monthlyViolations] = useState([
    { month: "Jan", total: 10 },
    { month: "Feb", total: 20 },
    { month: "Mar", total: 30 },
    { month: "Apr", total: 65 },
    { month: "May", total: 40 },
    { month: "Jun", total: 50 },
    { month: "Jul", total: 60 },
    { month: "Aug", total: 70 },
    { month: "Sep", total: 65 },
    { month: "Oct", total: 80 },
    { month: "Nov", total: 90 },
    { month: "Dec", total: 99 },
  ]);

  const COLORS = ["#d2a56a", "#a4702d", "#5b3d1e"];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-bar">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="user-account">
          <img src="/rcclogo.png" alt="RCC Logo" className="account-logo" />
          <span className="account-name">OSA</span>
          <span className="dropdown-icon">▾</span>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {/* Active Sanction Chart */}
        <div className="card">
          <h3>Active Sanction</h3>
          <div className="chart-section">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={sanctionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {sanctionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <ul className="legend">
              {sanctionData.map((entry, index) => (
                <li key={index}>
                  <span className={`dot ${entry.className}`}></span>
                  {entry.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Table of Violations */}
        <div className="card">
          <h3>Total of Students & Violations</h3>
          <div className="table-scroll-container">
            <table>
              <thead>
                <tr>
                  <th>Department / Grade</th>
                  <th>Violations</th>
                </tr>
              </thead>
              <tbody>
                {violationByDept.map((row, index) => (
                  <tr key={index}>
                    <td>{row.department}</td>
                    <td>{row.violations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Violation Trends Line Chart */}
        <div className="card">
          <h3>Student Violation Data</h3>
          <p style={{ fontSize: 14, color: "#555" }}>Total Violation Trends</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyViolations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
