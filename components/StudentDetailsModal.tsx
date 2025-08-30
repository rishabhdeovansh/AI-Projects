
import React, { useMemo } from 'react';
import type { Student } from '../types';
import { Modal } from './Modal';
import { StudentStatus } from '../types';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ isOpen, onClose, student }) => {
  const feeDetails = useMemo(() => {
    if (!student) return { totalPaid: 0, balance: 0, netPayable: 0 };
    const totalPaid = student.payments.reduce((acc, p) => acc + p.amount, 0);
    const netPayable = student.totalFees - student.discount;
    const balance = netPayable - totalPaid;
    return { totalPaid, balance, netPayable };
  }, [student]);

  if (!student) return null;

  const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="font-semibold text-text-primary">{value}</p>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Student Details: ${student.name}`}>
      <div className="space-y-6">
        {/* Personal & Enrollment Details */}
        <div className="p-4 bg-background rounded-lg">
            <h3 className="text-lg font-semibold text-primary mb-3">Personal & Enrollment Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem label="Student ID" value={<span className="font-mono">{student.id}</span>} />
                <DetailItem label="Guardian Name" value={student.guardianName} />
                <DetailItem label="Contact" value={student.contact} />
                <DetailItem label="Email" value={student.email} />
                <DetailItem label="Batch" value={student.batch} />
                <DetailItem label="Enrollment Date" value={student.enrollmentDate.toLocaleDateString()} />
                <DetailItem label="Status" value={
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === StudentStatus.ACTIVE ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>{student.status}</span>
                } />
            </div>
        </div>

        {/* Fee Summary */}
        <div className="p-4 bg-background rounded-lg">
            <h3 className="text-lg font-semibold text-primary mb-3">Fee Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-sidebar p-2 rounded-md"><p className="text-sm text-text-secondary">Total Fees</p><p className="font-bold text-lg">₹{student.totalFees.toLocaleString()}</p></div>
                <div className="bg-sidebar p-2 rounded-md"><p className="text-sm text-text-secondary">Discount</p><p className="font-bold text-lg text-yellow-400">₹{student.discount.toLocaleString()}</p></div>
                <div className="bg-sidebar p-2 rounded-md"><p className="text-sm text-text-secondary">Total Paid</p><p className="font-bold text-lg text-green-400">₹{feeDetails.totalPaid.toLocaleString()}</p></div>
                <div className="bg-sidebar p-2 rounded-md"><p className="text-sm text-text-secondary">Balance Due</p><p className="font-bold text-lg text-red-400">₹{feeDetails.balance.toLocaleString()}</p></div>
            </div>
        </div>
        
        {/* Payment History */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">Payment History</h3>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-left text-text-secondary">
              <thead className="bg-sidebar text-xs uppercase sticky top-0">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Receipt ID</th>
                </tr>
              </thead>
              <tbody>
                {student.payments.length > 0 ? student.payments.map(p => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="p-3">{p.date.toLocaleDateString()}</td>
                    <td className="p-3 font-semibold text-text-primary">₹{p.amount.toLocaleString()}</td>
                    <td className="p-3">{p.mode}</td>
                    <td className="p-3 font-mono">{p.id}</td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={4} className="text-center p-4">No payments recorded yet.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};
