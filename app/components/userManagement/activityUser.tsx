'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { FaDownload, FaPrint, FaArrowLeft, FaUser, FaPhone, FaUserShield, FaSignInAlt, FaSignOutAlt, FaClock } from 'react-icons/fa';
import { FiDownload, FiPrinter, FiArrowLeft as FiArrowLeftFi, FiFileText } from 'react-icons/fi';
import { HiOutlineDocumentArrowDown, HiOutlineDocumentText, HiOutlineArrowLeft, HiOutlinePrinter, HiUser, HiPhone, HiShieldCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';

interface Activity {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    phoneNumber: string;
    role: string;
  };
}

interface ActivityUserProps {
  userId: string;
  onClose: () => void;
}

type Session = { login: Activity; logout: Activity | null };

const ActivityUser: React.FC<ActivityUserProps> = ({ userId, onClose }) => {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line
  }, [userId, page, search, startDate, endDate]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '27',
        ...(search && { search: search.toLowerCase() }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });
      const response = await fetch(`/api/users/${userId}/activities?${queryParams}&order=asc`);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to fetch activities');
      }
      const data = await response.json();
      
      // Use backend's paginated and filtered activities directly
      setActivities(data.activities || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams({
        userId: String(userId),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });
      const response = await fetch(`/api/admin/activities/export?${queryParams}`);
      if (!response.ok) throw new Error('Failed to export activities');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-report-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to export activities');
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=900');
      if (printWindow) {
        printWindow.document.write('<html><head><title>User Activity Report</title>');
        printWindow.document.write('<style>body{font-family:sans-serif;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #e5e7eb;padding:8px;} th{background:#f3f4f6;} tr:nth-child(even){background:#f9fafb;} .header{font-size:1.5rem;font-weight:bold;margin-bottom:1rem;} .controls{margin-bottom:1rem;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      }
    }
  };

  // Get user details from the first activity (if available)
  const userDetails = activities[0]?.user;

  // Helper to group activities into sessions
  function groupSessions(activities: Activity[]): Session[] {
    const sessions: Session[] = [];
    let currentSession: Session | null = null;
    for (const act of activities) {
      if (act.action === 'LOGIN') {
        if (currentSession) sessions.push(currentSession);
        currentSession = { login: act, logout: null };
      } else if (act.action === 'LOGOUT' && currentSession) {
        currentSession.logout = act;
        sessions.push(currentSession);
        currentSession = null;
      }
    }
    if (currentSession) sessions.push(currentSession);
    return sessions;
  }

  const sessions = groupSessions(activities);

  // Calculate paginated sessions
  // Use all sessions if only one page, otherwise use backend's paginated data
  const paginatedSessions = groupSessions(activities);

  // Add PDF export handler
  const handlePDFExport = async () => {
    if (!printRef.current) return;

    try {
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      // Create a clone of the element to modify its size and colors
      const clone = printRef.current.cloneNode(true) as HTMLElement;
      document.body.appendChild(clone);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';

      // Function to convert any color format to RGB/HEX
      const convertToRGB = (color: string): string => {
        // If it's already a hex or rgb color, return as is
        if (color.startsWith('#') || color.startsWith('rgb')) {
          return color;
        }
        
        // Create a temporary element to get computed color
        const temp = document.createElement('div');
        temp.style.color = color;
        document.body.appendChild(temp);
        const computedColor = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);
        
        // Convert rgb(r, g, b) to hex
        const rgb = computedColor.match(/\d+/g);
        if (rgb && rgb.length === 3) {
          return '#' + rgb.map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('');
        }
        
        return '#000000'; // fallback
      };

      // Function to convert all colors in an element and its children
      const convertColors = (element: HTMLElement) => {
        const style = window.getComputedStyle(element);
        
        // Convert background color
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          element.style.backgroundColor = convertToRGB(style.backgroundColor);
        }
        
        // Convert text color
        if (style.color) {
          element.style.color = convertToRGB(style.color);
        }
        
        // Convert border color
        if (style.borderColor && style.borderColor !== 'rgba(0, 0, 0, 0)') {
          element.style.borderColor = convertToRGB(style.borderColor);
        }
        
        // Process all child elements
        Array.from(element.getElementsByTagName('*')).forEach(el => {
          const elStyle = window.getComputedStyle(el);
          
          // Convert background color
          if (elStyle.backgroundColor && elStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            (el as HTMLElement).style.backgroundColor = convertToRGB(elStyle.backgroundColor);
          }
          
          // Convert text color
          if (elStyle.color) {
            (el as HTMLElement).style.color = convertToRGB(elStyle.color);
          }
          
          // Convert border color
          if (elStyle.borderColor && elStyle.borderColor !== 'rgba(0, 0, 0, 0)') {
            (el as HTMLElement).style.borderColor = convertToRGB(elStyle.borderColor);
          }
        });
      };

      // Function to forcibly replace any oklch color in computed styles
      const patchOklchColors = (element: HTMLElement) => {
        const elements = [element, ...Array.from(element.getElementsByTagName('*'))];
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          // Patch background
          if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
            (el as HTMLElement).style.backgroundColor = '#ffffff';
          }
          // Patch text color
          if (style.color && style.color.includes('oklch')) {
            (el as HTMLElement).style.color = '#000000';
          }
          // Patch border color
          if (style.borderColor && style.borderColor.includes('oklch')) {
            (el as HTMLElement).style.borderColor = '#e5e7eb';
          }
        });
      };

      // Brute-force patch: forcibly set all color-related styles to safe values
      const forceSafeColors = (element: HTMLElement) => {
        const elements = [element, ...Array.from(element.getElementsByTagName('*'))];
        elements.forEach(el => {
          (el as HTMLElement).style.backgroundColor = '#ffffff';
          (el as HTMLElement).style.color = '#000000';
          (el as HTMLElement).style.borderColor = '#e5e7eb';
        });
      };

      // Apply color conversions, patch oklch, and force safe colors
      convertColors(clone);
      patchOklchColors(clone);
      forceSafeColors(clone);
      
      // Now apply all style and font changes
      // Set clone width to 2x A4 for higher resolution and larger fonts
      clone.style.width = '1680px'; // 2x 794px (A4 at 96dpi)
      clone.style.maxWidth = '1680px';
      clone.style.fontSize = '40px';

      // Temporarily increase font size for table headings and data in the clone
      const ths = clone.querySelectorAll('th');
      ths.forEach(th => {
        (th as HTMLElement).style.fontSize = '33px';
        (th as HTMLElement).style.fontWeight = 'bold';
      });
      const tds = clone.querySelectorAll('td');
      tds.forEach(td => {
        (td as HTMLElement).style.fontSize = '31px';
      });
      
      const canvas = await html2canvas(clone, {
        useCORS: true,
        logging: false,
        background: '#ffffff',
        allowTaint: true
      });
      
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // When adding the image to the PDF, scale it to fit the page width
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add title and user info
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('User Activity Report', 105, 20, { align: 'center' });
      
      if (userDetails) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        // Render user info in a single row, spaced evenly
        const userInfo = [
          `Name: ${userDetails.name}`,
          `Phone: ${userDetails.phoneNumber}`,
          `Role: ${userDetails.role}`
        ];
        // Calculate positions for 3 columns
        const colWidth = 210 / 3;
        userInfo.forEach((info, idx) => {
          pdf.text(info, colWidth * idx + colWidth / 2, 35, { align: 'center' });
        });
      }

      // Add the table with increased font size for headings and data
      // Draw the table image
      pdf.addImage(imgData, 'PNG', 0, 50, imgWidth, imgHeight);

      // Add footer
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          `Page ${i} of ${pageCount} - Generated on ${new Date().toLocaleString()}`,
          105,
          pdf.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      pdf.save(`activity-report-${userDetails?.name || 'user'}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="w-full mt-4 sm:mt-8 animate-fadeIn">
      {/* Controls (not printed) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 pb-2 border-b border-gray-100 print:hidden">
            <div>
          <div className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">User Activity Report</div>
              {userDetails && (
            <div className="flex flex-wrap gap-8 sm:gap-14 mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 items-center">
              <span className="flex items-center gap-3 font-semibold">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100">
                  <HiUser className="w-5 h-5 text-indigo-600" />
                </span>
                {userDetails.name}
              </span>
              <span className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
                  <HiPhone className="w-5 h-5 text-emerald-600" />
                </span>
                {userDetails.phoneNumber}
              </span>
              <span className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                  <HiShieldCheck className="w-5 h-5 text-orange-500" />
                </span>
                {userDetails.role}
              </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="p-2 rounded-full bg-gradient-to-tr from-green-200 to-green-100 hover:from-green-300 hover:to-green-200 text-green-800 hover:text-green-900 shadow transition flex items-center justify-center border border-green-200 hover:border-green-300"
                title="Print Report"
                aria-label="Print Report"
              >
                <HiOutlinePrinter className="w-5 h-5" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 rounded-full bg-gradient-to-tr from-blue-200 to-blue-100 hover:from-blue-300 hover:to-blue-200 text-blue-800 hover:text-blue-900 shadow transition flex items-center justify-center border border-blue-200 hover:border-blue-300"
                title="Export CSV"
                aria-label="Export CSV"
              >
                <HiOutlineDocumentArrowDown className="w-5 h-5" />
              </button>
              <button
                onClick={handlePDFExport}
                className="p-2 rounded-full bg-gradient-to-tr from-rose-200 to-rose-100 hover:from-rose-300 hover:to-rose-200 text-rose-800 hover:text-rose-900 shadow transition flex items-center justify-center border border-rose-200 hover:border-rose-300"
                title="Export PDF"
                aria-label="Export PDF"
              >
                <HiOutlineDocumentText className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 hover:from-gray-300 hover:to-gray-200 text-gray-700 hover:text-gray-900 shadow transition flex items-center justify-center border border-gray-200 hover:border-gray-300"
                title="Back"
                aria-label="Back"
              >
                <HiOutlineArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
      {/* Search and Filter Controls (not printed) */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center mt-4 mb-4 sm:mt-6 print:hidden">
          <input
            type="text"
          placeholder="Search by name, phone, role, time, or activity..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm shadow-sm"
          />
          <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
              className="flex-1 sm:flex-none px-2 py-1.5 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm shadow-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
              className="flex-1 sm:flex-none px-2 py-1.5 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm shadow-sm"
          />
        </div>
        </div>
      {/* Print Area: Only this will be printed */}
      <div ref={printRef} className="print-area">
        {/* Print-only heading and user info (only in print) */}
        {userDetails && (
          <div className="print-only" style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
              }}
            >
              User Activity Report
                  </div>
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                gap: '4rem',
                marginBottom: '1.5rem',
                fontSize: '1 rem',
                fontWeight: 500,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiUser className="inline" /> {userDetails.name}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiPhone className="inline" /> {userDetails.phoneNumber}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiShieldCheck className="inline" /> {userDetails.role}
              </span>
                    </div>
                  </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 w-full p-4 sm:p-6 text-gray-900">
          {/* Activity Table */}
          <div className="mt-4 overflow-x-auto rounded-lg shadow-sm">
            <table className="table min-w-full w-full border-separate border-spacing-y-0 text-xs sm:text-sm bg-transparent">
              <thead className="bg-[#E9E9E9] dark:bg-[#C3602D] text-xs uppercase font-bold text-gray-900">
                <tr>
                  <th className="py-2 px-2 text-left">Login Time</th>
                  <th className="py-2 px-2 text-left">Logout Time</th>
                  <th className="py-2 px-2 text-left">Session Duration</th>
                  <th className="py-2 px-2 text-left">Activity</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSessions.length === 0 && (
                  <tr><td colSpan={4} className="py-4 px-2 text-center text-gray-400">No activity found.</td></tr>
                )}
                {paginatedSessions.map((session, idx) => {
                  const loginTime = session.login.createdAt ? new Date(session.login.createdAt) : null;
                  const logoutTime = session.logout?.createdAt ? new Date(session.logout.createdAt) : null;
                  let duration = '-';
                  if (loginTime && logoutTime) {
                    const diff = Math.abs(logoutTime.getTime() - loginTime.getTime());
                    const mins = Math.floor(diff / 60000);
                    const secs = Math.floor((diff % 60000) / 1000);
                    duration = `${mins}m ${secs}s`;
                  }
                  return (
                    <tr key={idx} className={
                      `${idx % 2 === 0 ? 'bg-white' : ''} transition-colors`}
                    >
                      <td className="py-1 px-2 text-left whitespace-nowrap">{loginTime ? loginTime.toLocaleString() : '-'}</td>
                      <td className="py-1 px-2 text-left whitespace-nowrap">{logoutTime ? logoutTime.toLocaleString() : '-'}</td>
                      <td className="py-1 px-2 text-left">{duration}</td>
                      <td className="py-1 px-2 text-left">Session {(totalPages > 1 ? (page - 1) * 27 + idx + 1 : idx + 1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 mt-3">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={`px-2 py-1 rounded border text-sm font-semibold shadow transition-all duration-200 ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-800'}`}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`px-2 py-1 rounded border text-sm font-semibold shadow transition-all duration-200 ${page === idx + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-800'}`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className={`px-2 py-1 rounded border text-sm font-semibold shadow transition-all duration-200 ${page === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-800'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityUser; 