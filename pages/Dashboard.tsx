
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardCard } from '../components/DashboardCard';
import { StudentsIcon, FeesIcon } from '../components/icons/NavIcons';
import type { Student } from '../types';
import { StudentStatus } from '../types';

interface DashboardProps {
  students: Student[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export const Dashboard: React.FC<DashboardProps> = ({ students }) => {

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === StudentStatus.ACTIVE).length;
    const totalFeesCollected = students.reduce((acc, student) => acc + student.payments.reduce((pAcc, p) => pAcc + p.amount, 0), 0);
    const totalFeesDue = students.filter(s => s.status === StudentStatus.ACTIVE).reduce((acc, student) => {
        const totalPaid = student.payments.reduce((pAcc, p) => pAcc + p.amount, 0);
        const due = (student.totalFees - student.discount) - totalPaid;
        return acc + (due > 0 ? due : 0);
    }, 0);
    return { totalStudents, activeStudents, totalFeesCollected, totalFeesDue };
  }, [students]);

  const batchData = useMemo(() => {
    const batchCounts: {[key: string]: number} = {};
    students.forEach(student => {
        if(student.status === StudentStatus.ACTIVE) {
            batchCounts[student.batch] = (batchCounts[student.batch] || 0) + 1;
        }
    });
    return Object.entries(batchCounts).map(([name, value]) => ({ name, students: value }));
  }, [students]);
  
  const feeCollectionData = useMemo(() => {
    const monthlyCollection: { [key: string]: number } = {};
    students.forEach(student => {
        student.payments.forEach(payment => {
            const month = payment.date.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyCollection[month] = (monthlyCollection[month] || 0) + payment.amount;
        });
    });
    return Object.entries(monthlyCollection).map(([name, fees]) => ({ name, fees }));
  }, [students]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Students" value={stats.totalStudents} icon={<StudentsIcon />} colorClass="bg-blue-500" />
        <DashboardCard title="Active Students" value={stats.activeStudents} icon={<StudentsIcon />} colorClass="bg-green-500" />
        <DashboardCard title="Fees Collected" value={`₹${(stats.totalFeesCollected / 100000).toFixed(2)}L`} icon={<FeesIcon />} colorClass="bg-primary" />
        <DashboardCard title="Outstanding Dues" value={`₹${(stats.totalFeesDue / 100000).toFixed(2)}L`} icon={<FeesIcon />} colorClass="bg-yellow-500" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Fee Collection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={feeCollectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="name" stroke="#d1d5db" />
              <YAxis stroke="#d1d5db" tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
              <Legend />
              <Bar dataKey="fees" fill="#4f46e5" name="Fees Collected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Student Distribution by Batch</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={batchData} dataKey="students" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                {batchData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
