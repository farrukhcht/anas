"use client";

import { useEffect, useState } from "react";

export default function AddEmployee() {
  const [deps, setDeps] = useState<any[]>([]);

  const [EmpName, setEmpName] = useState("");
  const [EmpEmail, setEmpEmail] = useState("");
  const [EmpJoiningDate, setEmpJoiningDate] = useState("");
  const [EmpDepID, setEmpDepID] = useState<number | "">("");

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((json) => setDeps(json.data || json));
  }, []);

  const save = async () => {
    if (!EmpName || !EmpEmail || !EmpJoiningDate || !EmpDepID)
      return alert("All fields are required!");

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        EmpName,
        EmpEmail,
        EmpJoiningDate,
        EmpDepID,
      }),
    });

    if (!res.ok) return alert("Failed to save employee!");

    alert("Employee Saved!");
    window.location.href = "/employees";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">Add Employee</h1>

      <div className="bg-white p-4 rounded shadow">

        <input
          className="border p-2 mb-3 w-full"
          placeholder="Employee Name"
          value={EmpName}
          onChange={(e) => setEmpName(e.target.value)}
        />

        <input
          className="border p-2 mb-3 w-full"
          placeholder="Employee Email"
          value={EmpEmail}
          onChange={(e) => setEmpEmail(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 mb-3 w-full"
          value={EmpJoiningDate}
          onChange={(e) => setEmpJoiningDate(e.target.value)}
        />

        <select
          className="border p-2 mb-3 w-full"
          value={EmpDepID}
          onChange={(e) => setEmpDepID(Number(e.target.value))}
        >
          <option value="">Select Department</option>
          {deps.map((d) => (
            <option key={d.DepID} value={d.DepID}>
              {d.DepName}
            </option>
          ))}
        </select>

        <button
          onClick={save}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>

    </div>
  );
}
