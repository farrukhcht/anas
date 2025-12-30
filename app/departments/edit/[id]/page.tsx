"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Protected from "@/app/components/PageProtection";
export default function EditDepartmentPage(
    { params }: { params: Promise<{ id: string }> }
) {
    // FIX: unwrap params in client component
    const { id } = React.use(params);

    const [DepName, setDepName] = useState("");
    const [DepDes, setDepDes] = useState("");

    // Load existing department
    const loadDept = async () => {
        const res = await fetch(`/api/departments/${id}`);
        const json = await res.json();
        setDepName(json.DepName);
        setDepDes(json.DepDes);
    };

    useEffect(() => {
        loadDept();
    }, []);

    // Save updated department
    const updateDept = async () => {
        //const router = useRouter();

        if (!DepName.trim()) return alert("Department name required");

        const res = await fetch(`/api/departments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ DepName, DepDes }),
        });

        if (!res.ok) return alert("Update failed!");

        alert("Department updated successfully!");
        window.location.href = "/departments";

    };
    
    return (
        <Protected>
        <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
            <h1 className="text-2xl font-bold mb-4">Edit Department #{id}</h1>

            <input
                className="border w-full p-2 mb-3"
                placeholder="Department Name"
                value={DepName}
                onChange={(e) => setDepName(e.target.value)}
            />

            <input
                className="border w-full p-2 mb-3"
                placeholder="Description"
                value={DepDes}
                onChange={(e) => setDepDes(e.target.value)}
            />

            <button
                onClick={updateDept}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Update
            </button>
        </div>
        </Protected>
    );
}
