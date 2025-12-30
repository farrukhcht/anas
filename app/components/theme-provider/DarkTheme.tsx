'use client';

import React from 'react';

const DarkTheme = () => {
  return (
    <style jsx global>{`
      body {
        background: #0d0d10 !important;
        color: #f3f4f6 !important;
        min-height: 100vh;
      }

      /* Glassy Cards/Containers */
      .bg-white, .card, .modal, .dialog, .dropdown-menu {
        background: #18191A !important;
        border: 1.5px solid #23242A !important;
        border-radius: 1.25rem !important;
        box-shadow: 0 8px 32px 0 rgba(0,0,0,0.25), 0 1.5px 4px 0 rgba(0,0,0,0.10) !important;
      }

      /* Headings */
      h1, h2, h3, h4, h5, h6, .heading, .table th {
        color: #fff !important;
        font-weight: 700 !important;
        letter-spacing: 0.01em;
        text-shadow: 0 2px 8px #0004;
      }

      /* Labels */
      label, .label, .text-label {
        color: #a5b4fc !important;
        font-weight: 500 !important;
      }

      /* Text Colors */
      .text-gray-900, .text-primary {
        color: #f3f4f6 !important;
      }
      .text-gray-700, .text-secondary {
        color: #cbd5e1 !important;
      }
      .text-gray-500 {
        color: #94a3b8 !important;
      }

      /* Borders */
      .border-gray-200 {
        border-color: rgba(255,255,255,0.12) !important;
      }

      /* Form Elements */
      input, select, textarea {
        background: #18191A !important;
        border: 1.5px solid #23242A !important;
        color: #fff !important;
        border-radius: 0.75rem !important;
        box-shadow: 0 1px 4px 0 #0002;
      }
      input:focus, select:focus, textarea:focus {
        border-color: #2563eb !important;
        box-shadow: 0 0 0 2px #2563eb55 !important;
      }
      ::placeholder {
        color: #64748b !important;
        opacity: 1;
      }

      /* Buttons - transparent background, no border, no shadow in dark mode */
      button, .btn {
        background: #23242A !important;
        color: #22c55e !important;
        border: none !important;
        box-shadow: none !important;
      }
      button:active, .btn:active, button:focus, .btn:focus {
        background: transparent !important;
        color: #16a34a !important; /* green-600 */
        box-shadow: none !important;
      }
      /* Icon color for edit/delete if needed */
      .icon-edit, .btn-edit {
        color: #fbbf24 !important; /* amber-400 */
      }
      .icon-delete, .btn-delete {
        color: #f43f5e !important; /* rose-500 */
      }
      /* All SVG icons default to green in dark mode */
      svg, .icon {
        color: #34d399 !important; /* emerald-400 */
        filter: none !important;
      }
      /* Remove background and shadow from icon buttons */
      .icon-btn, .btn-icon {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
      }

      /* Table */
      .table {
        background: #18191A !important;
        color: #f3f4f6 !important;
        border-radius: 1.25rem;
        border: 1.5px solid #23242A !important;
        overflow: hidden;
      }
      .table th {
        background: #23242A !important;
        color: #a5b4fc !important;
        border-bottom: 2px solid #23242A !important;
      }
      .table td {
        color: #f3f4f6 !important;
        border-bottom: 1px solid #23242A !important;
      }
      .table tr:nth-child(even) td {
        background: none !important;
      }
      .table tr:hover td {
        background: #23242A !important;
      }

      /* Shadows */
      .shadow, .shadow-md {
        box-shadow: 0 4px 16px 0 #0002, 0 1.5px 4px 0 #fff2 !important;
      }
      .shadow-lg {
        box-shadow: 0 10px 32px -3px #0004, 0 4px 6px -2px #fff2 !important;
      }

      /* Links */
      a {
        color: #a5b4fc !important;
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      a:hover {
        color: #fff !important;
      }

      /* Dividers */
      hr {
        border-color: rgba(255,255,255,0.12) !important;
      }

      /* Scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.7) !important;
      }
      ::-webkit-scrollbar-thumb {
        background: #a5b4fc !important;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #fff !important;
      }

      /* Modal/Dialog */
      .modal, .dialog {
        background: rgba(30, 41, 59, 0.7) !important;
        border: 1.5px solid rgba(255,255,255,0.12) !important;
        box-shadow: 0 10px 32px -3px #0004, 0 4px 6px -2px #fff2 !important;
      }

      /* Dropdowns */
      .dropdown-menu {
        background: rgba(30, 41, 59, 0.7) !important;
        border: 1.5px solid rgba(255,255,255,0.12) !important;
        box-shadow: 0 4px 16px 0 #0002, 0 1.5px 4px 0 #fff2 !important;
      }
      .dropdown-item {
        color: #f3f4f6 !important;
      }
      .dropdown-item:hover {
        background: rgba(255,255,255,0.10) !important;
        color: #232a36 !important;
      }

      /* Tooltips */
      .tooltip {
        background: rgba(30, 41, 59, 0.7) !important;
        border: 1.5px solid rgba(255,255,255,0.12) !important;
        color: #f3f4f6 !important;
      }

      /* Badges */
      .badge {
        background: #fffbe7 !important;
        color: #232a36 !important;
        font-weight: 700;
        box-shadow: 0 1px 4px 0 #fff2;
        border: 1.5px solid #fffbe7 !important;
      }
      .badge.pastel-orange { background: #ffeedd !important; color: #232a36 !important; border-color: #ffeedd !important; }
      .badge.pastel-purple { background: #ede9fe !important; color: #232a36 !important; border-color: #ede9fe !important; }
      .badge.pastel-green { background: #d1fae5 !important; color: #232a36 !important; border-color: #d1fae5 !important; }
      .badge.pastel-blue { background: #e0f2fe !important; color: #232a36 !important; border-color: #e0f2fe !important; }

      /* Alerts */
      .alert {
        background: rgba(30, 41, 59, 0.7) !important;
        border: 1.5px solid #fffbe7 !important;
        color: #f3f4f6 !important;
      }

      /* Code blocks */
      pre, code {
        background: rgba(30, 41, 59, 0.7) !important;
        color: #a5b4fc !important;
        border: 1.5px solid rgba(255,255,255,0.12) !important;
      }

      /* Modern borders for table, cards, inputs */
      .table, .card, .modal, .dialog, .dropdown-menu, input, select, textarea {
        border-color: #23242A !important;
      }

      /* Icon colors for actions */
      .icon-activity, .btn-activity { color: #38bdf8 !important; } /* sky-400 */
      .icon-home, .icon-back, .icon-plus { color: #22d3ee !important; } /* cyan-400 */
      .icon-default, svg, .icon { color: #34d399 !important; } /* emerald-400 */

      /* Button colors for actions */
      .btn-save { background: #10b981 !important; color: #fff !important; box-shadow: 0 2px 8px 0 #10b98144; border-radius: 0.75rem !important; }
      .btn-update { background: #2563eb !important; color: #fff !important; box-shadow: 0 2px 8px 0 #2563eb44; border-radius: 0.75rem !important; }
      .btn-cancel { background: #64748b !important; color: #fff !important; box-shadow: 0 2px 8px 0 #64748b44; border-radius: 0.75rem !important; }

      /* Sidebar selected link: blue in light mode */
      .sidebar-link {
        color: #cbd5e1 !important;
        background: transparent !important;
        border-radius: 0.75rem !important;
        transition: background 0.2s, color 0.2s;
      }
      /* --- SIDEBAR SELECTED LINK: FINAL OVERRIDE --- */
      .sidebar-link.selected, .sidebar-link.selected:focus {
        background: #2563eb !important;
        color: #fff !important;
        border-radius: 0.75rem !important;
        box-shadow: 0 2px 8px 0 #2563eb44;
      }
      html.dark .sidebar-link.selected, html.dark .sidebar-link.selected:focus {
        background: #8b5cf6 !important;
        color: #fff !important;
        border-radius: 0.75rem !important;
        box-shadow: 0 2px 8px 0 #8b5cf644;
      }
      .sidebar-link.selected .icon, .sidebar-link.selected svg {
        color: #22d3ee !important;
      }
      /* Sidebar unselected */
      .sidebar-link:hover {
        background: #23242A !important;
        color: #fff !important;
      }

      /* Checkbox, radio, etc */
      input[type="checkbox"], input[type="radio"] {
        accent-color: #2563eb !important;
        background: #23242A !important;
        border: 1.5px solid #2563eb !important;
      }

      /* Only override icon and button colors in dark mode, do not affect light mode at all */
      html.dark .icon-activity { color: #38bdf8 !important; } /* sky-400 */
      html.dark .icon-edit { color: #fbbf24 !important; } /* amber-400 */
      html.dark .icon-delete { color: #f43f5e !important; } /* rose-500 */
      html.dark .icon-home, html.dark .icon-back, html.dark .icon-plus { color: #22d3ee !important; } /* cyan-400 */
      html.dark .icon-btn {
        border: 1.5px solid #2563eb !important;
        background: transparent !important;
        box-shadow: none !important;
      }
      /* Remove table row striping in dark mode only */
      html.dark .table tr:nth-child(even) td {
        background: none !important;
      }

      /* Table improvements for dark mode only */
      html.dark .table thead, html.dark .table th {
        background: #C3602D !important;
        color: #e5e7eb !important;
        border-bottom: 2px solid #23242A !important;
      }
      html.dark .table tbody tr, html.dark .table td {
        background: #18191A !important;
        color: #e5e7eb !important;
        border-bottom: 1px solid #23242A !important;
      }
      html.dark .table tr:hover td {
        background: #23242A !important;
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

export default DarkTheme; 