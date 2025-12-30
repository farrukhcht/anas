"use client";
import React from "react";
import { useEffect, useState } from "react";

export default function EditEmployee(
    // { params }: any) {
    // const { id } = params;
    { params }: { params: Promise<{ id: string }> }
) {
  // FIX: unwrap params (client component)
  const { id } = React.use(params);

    const [deps, setDeps] = useState<any[]>([]);

    const [EmpName, setEmpName] = useState("");
    const [EmpEmail, setEmpEmail] = useState("");
    const [EmpJoiningDate, setEmpJoiningDate] = useState("");
    const [EmpDepID, setEmpDepID] = useState<number | "">("");

    useEffect(() => {
        const load = async () => {
            const emp = await fetch(`/api/employees/${id}`).then((r) => r.json());
            const dps = await fetch("/api/departments").then((r) => r.json());

            setEmpName(emp.EmpName);
            setEmpEmail(emp.EmpEmail);
            setEmpJoiningDate(emp.EmpJoiningDate.split("T")[0]);
            setEmpDepID(emp.EmpDepID);
            setDeps(dps.data || dps);
        };

        load();
    }, []);

    const update = async () => {
        if (!EmpName || !EmpEmail || !EmpJoiningDate || !EmpDepID)
            return alert("All fields are required!");

        const res = await fetch(`/api/employees/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                EmpName,
                EmpEmail,
                EmpJoiningDate,
                EmpDepID,
            }),
        });

        if (!res.ok) return alert("Update failed!");

        alert("Employee updated!");
        window.location.href = "/employees";
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">

            <h1 className="text-2xl font-bold mb-4">Edit Employee</h1>

            <div className="bg-white p-4 rounded shadow">

                <input
                    className="border p-2 mb-3 w-full"
                    value={EmpName}
                    onChange={(e) => setEmpName(e.target.value)}
                />

                <input
                    className="border p-2 mb-3 w-full"
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
                    onClick={update}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Update
                </button>
            </div>

        </div>
    );
}
