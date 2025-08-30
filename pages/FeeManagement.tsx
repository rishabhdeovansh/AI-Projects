import React, { useState, useMemo, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Modal } from '../components/Modal';
import type { Student, Payment } from '../types';
import { PaymentMode } from '../types';

declare var XLSX: any;

interface FeeManagementProps {
    students: Student[];
    selectedStudent: Student | null;
    setSelectedStudent: Dispatch<SetStateAction<Student | null>>;
    addPayment: (studentId: string, payment: Omit<Payment, 'id' | 'date'>) => void;
    addPaymentBatch: (studentId: string, payments: Omit<Payment, 'id' | 'date'>[]) => void;
}

const initialPaymentState = { amount: 0, mode: PaymentMode.UPI, referenceImage: undefined };

export const FeeManagement: React.FC<FeeManagementProps> = ({ students, selectedStudent, setSelectedStudent, addPayment, addPaymentBatch }) => {
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState<{amount: number, mode: PaymentMode, referenceImage?: string}>(initialPaymentState);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const importFileRef = useRef<HTMLInputElement>(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        mode: 'ALL',
        minAmount: '',
        maxAmount: '',
    });

    const feeDetails = useMemo(() => {
        if (!selectedStudent) return { totalPaid: 0, balance: 0, netPayable: 0 };
        const totalPaid = selectedStudent.payments.reduce((acc, p) => acc + p.amount, 0);
        const netPayable = selectedStudent.totalFees - selectedStudent.discount;
        const balance = netPayable - totalPaid;
        return { totalPaid, balance, netPayable };
    }, [selectedStudent]);

    const filteredPayments = useMemo(() => {
        if (!selectedStudent) return [];

        return selectedStudent.payments.filter(payment => {
            const paymentDate = new Date(payment.date);

            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            if (startDate) startDate.setHours(0, 0, 0, 0);

            const endDate = filters.endDate ? new Date(filters.endDate) : null;
            if (endDate) endDate.setHours(23, 59, 59, 999);

            if (startDate && paymentDate < startDate) return false;
            if (endDate && paymentDate > endDate) return false;
            
            if (filters.mode !== 'ALL' && payment.mode !== filters.mode) {
                return false;
            }

            const min = parseFloat(filters.minAmount);
            if (!isNaN(min) && payment.amount < min) {
                return false;
            }
            
            const max = parseFloat(filters.maxAmount);
            if (!isNaN(max) && payment.amount > max) {
                return false;
            }

            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedStudent, filters]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            mode: 'ALL',
            minAmount: '',
            maxAmount: '',
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPaymentData(prev => ({ ...prev, referenceImage: base64String }));
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddPayment = () => {
        if (selectedStudent && paymentData.amount > 0) {
            addPayment(selectedStudent.id, paymentData);
            setPaymentModalOpen(false);
            setPaymentData(initialPaymentState);
            setImagePreview(null);
        }
    };
    
    const handleOpenPaymentModal = () => {
        setPaymentData(initialPaymentState);
        setImagePreview(null);
        setPaymentModalOpen(true);
    };

    const handleImportClick = () => {
        importFileRef.current?.click();
    };

    const handlePaymentImport = (e: React.ChangeEvent<HTMLInputElement>) => {
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

                    const paymentsByStudent: { [key: string]: Omit<Payment, 'id' | 'date'>[] } = {};
                    
                    json.forEach(row => {
                        const studentId = String(row['Student ID']);
                        const amount = Number(row['Amount']);
                        const mode = row['Mode'] as PaymentMode || PaymentMode.CASH;

                        if (studentId && amount > 0 && students.some(s => s.id === studentId)) {
                            if (!paymentsByStudent[studentId]) {
                                paymentsByStudent[studentId] = [];
                            }
                            paymentsByStudent[studentId].push({ amount, mode });
                        }
                    });

                    Object.entries(paymentsByStudent).forEach(([studentId, payments]) => {
                        addPaymentBatch(studentId, payments);
                    });

                    alert(`${json.length} payment records processed successfully!`);
                } catch (error) {
                    console.error("Error parsing Excel file:", error);
                    alert("Failed to import payments. Please check the file format and column headers (Student ID, Amount, Mode).");
                }
            };
            reader.readAsArrayBuffer(file);
        }
        if(e.target) e.target.value = '';
    };

    return (
        <div className="space-y-6">
            <div className="bg-card p-4 rounded-lg shadow-lg flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                    <label htmlFor="student-select" className="font-semibold text-text-primary">Select Student:</label>
                    <select 
                        id="student-select"
                        className="p-2 bg-background border border-border rounded w-full md:w-64"
                        value={selectedStudent?.id || ''}
                        onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value) || null)}
                    >
                        <option value="" disabled>-- Select a Student --</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                    </select>
                </div>
                 <div>
                    <button
                        onClick={handleImportClick}
                        className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Import Payments
                    </button>
                    <input type="file" ref={importFileRef} onChange={handlePaymentImport} accept=".xlsx, .xls" className="hidden" />
                </div>
            </div>

            {selectedStudent ? (
                <div className="bg-card p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary">{selectedStudent.name}</h2>
                            <p className="text-text-secondary">{selectedStudent.batch} | {selectedStudent.id}</p>
                        </div>
                        <button onClick={handleOpenPaymentModal} className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex-shrink-0">
                            Record Payment
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                        <div className="bg-background p-3 rounded-lg"><p className="text-sm text-text-secondary">Total Fees</p><p className="font-bold text-lg">₹{selectedStudent.totalFees.toLocaleString()}</p></div>
                        <div className="bg-background p-3 rounded-lg"><p className="text-sm text-text-secondary">Discount</p><p className="font-bold text-lg text-yellow-400">₹{selectedStudent.discount.toLocaleString()}</p></div>
                        <div className="bg-background p-3 rounded-lg"><p className="text-sm text-text-secondary">Total Paid</p><p className="font-bold text-lg text-green-400">₹{feeDetails.totalPaid.toLocaleString()}</p></div>
                        <div className="bg-background p-3 rounded-lg"><p className="text-sm text-text-secondary">Balance Due</p><p className="font-bold text-lg text-red-400">₹{feeDetails.balance.toLocaleString()}</p></div>
                    </div>
                    
                    <div className="my-6 p-4 bg-sidebar rounded-lg">
                        <h4 className="text-md font-semibold text-text-primary mb-3">Filter Transactions</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Start Date</label>
                                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-2 w-full bg-background border border-border rounded" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">End Date</label>
                                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-2 w-full bg-background border border-border rounded" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Payment Mode</label>
                                <select name="mode" value={filters.mode} onChange={handleFilterChange} className="p-2 w-full bg-background border border-border rounded">
                                    <option value="ALL">All Modes</option>
                                    {Object.values(PaymentMode).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Min Amount</label>
                                <input type="number" name="minAmount" value={filters.minAmount} onChange={handleFilterChange} placeholder="e.g. 5000" className="p-2 w-full bg-background border border-border rounded" />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Max Amount</label>
                                <input type="number" name="maxAmount" value={filters.maxAmount} onChange={handleFilterChange} placeholder="e.g. 10000" className="p-2 w-full bg-background border border-border rounded" />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button onClick={clearFilters} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors text-sm">Clear Filters</button>
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-4 text-text-primary">Payment Ledger</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-text-secondary">
                          <thead className="bg-sidebar text-xs uppercase">
                            <tr>
                                <th className="p-3">Date</th><th className="p-3">Amount</th>
                                <th className="p-3">Mode</th><th className="p-3">Receipt ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map(p => (
                                    <tr key={p.id} className="border-b border-border hover:bg-background">
                                        <td className="p-3">{new Date(p.date).toLocaleDateString()}</td>
                                        <td className="p-3 font-semibold text-text-primary">₹{p.amount.toLocaleString()}</td>
                                        <td className="p-3">{p.mode}</td>
                                        <td className="p-3 font-mono">{p.id}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-6 text-text-secondary">
                                        {selectedStudent.payments.length === 0 
                                            ? "No payments have been recorded for this student."
                                            : "No payments match the current filter criteria."}
                                    </td>
                                </tr>
                            )}
                          </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-card p-6 rounded-lg shadow-lg text-center h-64 flex flex-col justify-center">
                    <svg className="w-16 h-16 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <h2 className="text-xl font-semibold text-text-primary">Select a student to view their fee details.</h2>
                    <p className="text-text-secondary mt-2">Use the dropdown menu above to get started.</p>
                </div>
            )}
            
            <Modal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} title={`Record Payment for ${selectedStudent?.name}`}>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Amount</label>
                        <input type="number" value={paymentData.amount} onChange={e => setPaymentData(p => ({...p, amount: Number(e.target.value)}))} className="p-2 w-full bg-background border border-border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Payment Mode</label>
                        <select value={paymentData.mode} onChange={e => setPaymentData(p => ({...p, mode: e.target.value as PaymentMode}))} className="p-2 w-full bg-background border border-border rounded">
                            {Object.values(PaymentMode).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Reference Image (Optional)</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-indigo-700"/>
                    </div>
                    {imagePreview && <div className="mt-4"><img src={imagePreview} alt="Reference Preview" className="max-h-40 rounded-lg"/></div>}
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleAddPayment} className="bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            Add Payment
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};