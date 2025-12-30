"use client";

import { useEffect, useState } from "react";

export default function EmployeesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [deps, setDeps] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const loadEmployees = async () => {
    const res = await fetch(`/api/employees?search=${search}&page=${page}&limit=${limit}`);
    const json = await res.json();
    setItems(json.data);
    setTotal(json.total);
  };

  const loadDeps = async () => {
    const r = await fetch("/api/departments");
    const json = await r.json();
    setDeps(json.data || json); // If pagination removed
  };

  useEffect(() => {
    loadEmployees();
    loadDeps();
  }, [search, page]);

  const deleteEmp = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    await fetch(`/api/employees/${id}`, { method: "DELETE" });
    loadEmployees();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Employees</h1>

        <a
          href="/employees/add"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New
        </a>
      </div>

      <input
        className="border w-full p-2 mb-4"
        placeholder="Search employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Joining Date</th>
            <th className="p-2 border">Department</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((emp) => (
            <tr key={emp.EmpID}>
              <td className="border p-2">{emp.EmpName}</td>
              <td className="border p-2">{emp.EmpEmail}</td>
              <td className="border p-2">
                {new Date(emp.EmpJoiningDate).toLocaleDateString()}
              </td>
              <td className="border p-2">{emp.Department?.DepName}</td>
              <td className="border p-2 text-center">
                <div className="flex justify-center items-center space-x-3">
                <a href={`/employees/edit/${emp.EmpID}`} className="text-blue-600">Edit</a> |
                <button
                  className="text-red-600 ml-2 text-center cursor-pointer"
                  onClick={() => deleteEmp(emp.EmpID)}
                >
                  Delete
                </button>
</div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>

    </div>
  );
}
