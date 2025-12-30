'use client';

import React from 'react';

const LightTheme = () => {
  return (
    <style jsx global>{`
      body {
        background-color: #ffffff !important;
        color: #171717 !important;
      }

      .bg-white {
        background-color: #ffffff !important;
      }

      .bg-gray-50 {
        background-color: #f9fafb !important;
      }

      .text-gray-900 {
        color: #171717 !important;
      }

      .text-gray-700 {
        color: #374151 !important;
      }

      .border-gray-200 {
        border-color: #e5e7eb !important;
      }

      input, select, textarea {
        background-color: #ffffff !important;
        border-color: #d1d5db !important;
        color: #171717 !important;
      }

      .card {
        background-color: #ffffff !important;
        border-color: #e5e7eb !important;
      }

      .table {
        background-color: #ffffff !important;
        color: #171717 !important;
      }

      .table th {
        background-color: #f9fafb !important;
        color: #171717 !important;
      }

      .table td {
        color: #171717 !important;
      }

      .sidebar-link.selected, .sidebar-link.selected:focus {
        background: #2563eb !important;
        color: #fff !important;
        border-radius: 0.75rem !important;
        box-shadow: 0 2px 8px 0 #2563eb44;
      }
      .sidebar-link.selected .icon, .sidebar-link.selected svg {
        color: #22d3ee !important;
      }

      .topbar-username {
        color: #22c55e !important; /* green-500 */
        font-size: 1rem;
        font-weight: 600;
        border: 1.5px solid #bbf7d0; /* green-100 */
        border-radius: 0.7rem;
        padding: 0.2rem 0.7rem;
        background: #f0fdf4;
        box-shadow: 0 1px 4px 0 #bbf7d044;
        letter-spacing: 0.03em;
        margin-left: 0.5rem;
      }
    `}</style>
  );
};

export default LightTheme; 