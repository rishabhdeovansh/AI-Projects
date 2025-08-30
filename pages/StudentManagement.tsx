
import React, { useState, useRef, useMemo } from 'react';
import { Modal } from '../components/Modal';
import { AdminPasswordModal } from '../components/AdminPasswordModal';
import { StudentDetailsModal } from '../components/StudentDetailsModal';
import type { Student } from '../types';
import { StudentStatus } from '../types';

declare var XLSX: any;

interface StudentManagementProps {
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  batches: string[];
  addStudentsBatch: (students: Student[]) => void;
}

const initialFormState: Omit<Student, 'id' | 'enrollmentDate' | 'payments' > = {
    name: '',
    guardianName: '',
    contact: '',
    email: '',
    batch: '',
    status: StudentStatus.ACTIVE,
    totalFees: 0,
    discount: 0,
};

export const StudentManagement: React.FC<StudentManagementProps> = ({ students, addStudent, updateStudent, batches, addStudentsBatch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);
  const [formData, setFormData] = useState({...initialFormState, batch: batches[0] || '' });
  const [pendingStudent, setPendingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    student: Student | null;
    newStatus: StudentStatus | null;
  }>({ isOpen: false, student: null, newStatus: null });
  const importFileRef = useRef<HTMLInputElement>(null);

  const filteredStudents = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (!lowercasedQuery) {
      return students;
    }

    return students.filter(student =>
      student.name.toLowerCase().includes(lowercasedQuery) ||
      student.id.toLowerCase().includes(lowercasedQuery) ||
      student.contact.includes(lowercasedQuery)
    );
  }, [students, searchQuery]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: name === 'totalFees' || name === 'discount' ? Number(value) : value }));
  };

  const handleFormSubmit = () => {
    const newStudent: Student = {
        ...formData,
        id: `CE${new Date().getFullYear()}${(students.length + 1).toString().padStart(3, '0')}`,
        enrollmentDate: new Date(),
        payments: [],
    };

    if (formData.discount > 0) {
        setPendingStudent(newStudent);
        setIsPasswordModalOpen(true);
    } else {
        addStudent(newStudent);
        setIsModalOpen(false);
        setFormData({...initialFormState, batch: batches[0] || '' });
    }
  };

  const handlePasswordSuccess = () => {
    if (pendingStudent) {
        addStudent(pendingStudent);
        setPendingStudent(null);
    }
    setIsPasswordModalOpen(false);
    setIsModalOpen(false);
    setFormData({...initialFormState, batch: batches[0] || '' });
  };
  
  const handleStatusChangeClick = (e: React.MouseEvent, student: Student, newStatus: StudentStatus) => {
    e.stopPropagation();
    setConfirmationModal({ isOpen: true, student, newStatus });
  }

  const handleConfirmStatusChange = () => {
    if (confirmationModal.student && confirmationModal.newStatus) {
      updateStudent({ ...confirmationModal.student, status: confirmationModal.newStatus });
    }
    setConfirmationModal({ isOpen: false, student: null, newStatus: null });
  };

  const handleCancelStatusChange = () => {
    setConfirmationModal({ isOpen: false, student: null, newStatus: null });
  };
  
  const handleRowClick = (student: Student) => {
    setSelectedStudentForDetails(student);
    setIsDetailsModalOpen(true);
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleStudentImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet);

          const newStudents: Student[] = json.map((row, index) => ({
            id: `CE${new Date().getFullYear()}${(students.length + 1 + index).toString().padStart(3, '0')}`,
            name: row['Name'] || '',
            guardianName: row['Guardian Name'] || '',
            contact: String(row['Contact'] || ''),
            email: row['Email'] || '',
            batch: row['Batch'] || '',
            status: StudentStatus.ACTIVE,
            totalFees: Number(row['Total Fees']) || 0,
            discount: Number(row['Discount']) || 0,
            enrollmentDate: new Date(),
            payments: [],
          }));
          addStudentsBatch(newStudents);
          alert(`${newStudents.length} students imported successfully!`);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          alert("Failed to import students. Please check the file format and column headers (Name, Guardian Name, Contact, Email, Batch, Total Fees, Discount).");
        }
      };
      reader.readAsArrayBuffer(file);
    }
    if(e.target) e.target.value = '';
  };


  return (
    <div className="bg-card p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Student Management</h2>
        <div className="flex space-x-2">
            <button
                onClick={handleImportClick}
                className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Import from Excel
            </button>
            <input type="file" ref={importFileRef} onChange={handleStudentImport} accept=".xlsx, .xls" className="hidden" />
            <button
              onClick={() => { setFormData({...initialFormState, batch: batches[0] || ''}); setIsModalOpen(true); }}
              className="bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Add New Student
            </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search students by name, ID, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-11 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
            aria-label="Search students"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-text-secondary">
          <thead className="bg-sidebar text-xs uppercase">
            <tr>
              <th className="p-3">Student ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Batch</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Enrollment Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
              <tr key={student.id} onClick={() => handleRowClick(student)} className="border-b border-border hover:bg-background cursor-pointer">
                <td className="p-3 font-mono">{student.id}</td>
                <td className="p-3 font-semibold text-text-primary">{student.name}</td>
                <td className="p-3">{student.batch}</td>
                <td className="p-3">{student.contact}</td>
                <td className="p-3">{student.enrollmentDate.toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === StudentStatus.ACTIVE ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>{student.status}</span>
                </td>
                <td className="p-3 text-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    {student.status === StudentStatus.ACTIVE ? (
                        <button onClick={(e) => handleStatusChangeClick(e, student, StudentStatus.LEFT)} className="text-yellow-400 hover:text-yellow-300 text-xs">Mark as Left</button>
                    ) : (
                        <button onClick={(e) => handleStatusChangeClick(e, student, StudentStatus.ACTIVE)} className="text-green-400 hover:text-green-300 text-xs">Mark as Active</button>
                    )}
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center p-4 text-text-secondary">
                  No students found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Student">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Student Name" className="p-2 bg-background border border-border rounded" />
          <input name="guardianName" value={formData.guardianName} onChange={handleInputChange} placeholder="Guardian Name" className="p-2 bg-background border border-border rounded" />
          <input name="contact" value={formData.contact} onChange={handleInputChange} placeholder="Contact Number" className="p-2 bg-background border border-border rounded" />
          <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="p-2 bg-background border border-border rounded" />
          <select name="batch" value={formData.batch} onChange={handleInputChange} className="p-2 bg-background border border-border rounded">
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input name="totalFees" type="number" value={formData.totalFees} onChange={handleInputChange} placeholder="Total Fees" className="p-2 bg-background border border-border rounded" />
          <input name="discount" type="number" value={formData.discount} onChange={handleInputChange} placeholder="Discount Amount" className="p-2 bg-background border border-border rounded" />
        </div>
        <div className="mt-6 flex justify-end">
            <button onClick={handleFormSubmit} className="bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Save Student
            </button>
        </div>
      </Modal>

      <AdminPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
        actionDescription="Apply Discount"
      />

      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={handleCancelStatusChange}
        title="Confirm Status Change"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to change the status of <strong className="text-text-primary">{confirmationModal.student?.name}</strong> to <strong className="text-text-primary">{confirmationModal.newStatus}</strong>?
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleCancelStatusChange}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmStatusChange}
              className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
      
      <StudentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        student={selectedStudentForDetails}
      />
    </div>
  );
};
