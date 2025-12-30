"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Protection from "../components/PageProtection";
export default function DepartmentsPage() {
   
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [DepName, setDepName] = useState("");
    const [DepDes, setDepDes] = useState("");

    const limit = 5;

    const load = async () => {
        const res = await fetch(`/api/departments?search=${search}&page=${page}&limit=${limit}`);
        const json = await res.json();
        setItems(json.data);
        setTotal(json.total);
    };

    useEffect(() => {
        load();
    }, [search, page]);

    const saveDept = async () => {
        if (!DepName.trim()) return alert("Department name required");

        await fetch(`/api/departments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ DepName, DepDes }),
        });

        setDepName("");
        setDepDes("");
        load();
    };

    const deleteDept = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        await fetch(`/api/departments/${id}`, { method: "DELETE" });
        load();
    };




    return (
     <Protection>
        <div className="p-6 max-w-4xl mx-auto">

            <h1 className="text-2xl font-bold mb-4">Departments</h1>

            {/* Add form */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="text-xl mb-2">Add Department</h2>

                <input
                    className="border w-full p-2 mb-2"
                    placeholder="Department Name"
                    value={DepName}
                    onChange={(e) => setDepName(e.target.value)}
                />

                <input
                    className="border w-full p-2 mb-2"
                    placeholder="Description"
                    value={DepDes}
                    onChange={(e) => setDepDes(e.target.value)}
                />

                <button
                    onClick={saveDept}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Save
                </button>
            </div>

            {/* Search */}
            <input
                className="border p-2 mb-4 w-full"
                placeholder="Search department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* Table */}
            <table className="w-full border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Description</th>
                        <th className="p-2 border">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((d) => (
                        <tr key={d.DepID}>
                            <td className="border p-2">{d.DepName}</td>
                            <td className="border p-2">{d.DepDes}</td>
                            <td className="border p-2">
                                {/* <button className="text-blue-600" >Edit</button>{" "} */}
                                <div className="flex justify-center items-center space-x-3">
                                    <Link
                                        href={`/departments/edit/${d.DepID}`}
                                        className="text-blue-600 underline"
                                    >
                                        Edit
                                    </Link> |

                                    <button
                                        onClick={() => deleteDept(d.DepID)}
                                        className="text-red-600 ml-2 cursor-pointer"
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
       </Protection>
    );
}
