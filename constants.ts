import type { Student, TeamMember } from './types';
import { StudentStatus, PaymentMode } from './types';

export const ADMIN_PASSWORD = '5290';

// Note: Replace with your actual Google Cloud Project credentials
export const GOOGLE_API_KEY = process.env.API_KEY || '[YOUR_API_KEY]'; 
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '[YOUR_CLIENT_ID].apps.googleusercontent.com';
export const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';
export const DRIVE_FILE_NAME = 'CoachERP_data.json';


export const initialBatches: string[] = [
    'JEE Mains 2025',
    'NEET 2025',
    'JEE Advanced 2024',
    'Foundation IX',
    'Foundation X'
];

export const initialTeamMembers: TeamMember[] = [
    { id: 'TM001', name: 'Ravi Kumar', role: 'Physics Faculty' },
    { id: 'TM002', name: 'Sunita Sharma', role: 'Counselor' },
];

export const initialStudents: Student[] = [
  {
    id: 'CE2024001',
    name: 'Aarav Sharma',
    guardianName: 'Rajesh Sharma',
    contact: '9876543210',
    email: 'aarav.sharma@email.com',
    batch: 'JEE Mains 2025',
    enrollmentDate: new Date('2024-04-15'),
    status: StudentStatus.ACTIVE,
    totalFees: 120000,
    discount: 10000,
    payments: [
      { id: 'PAY001', date: new Date('2024-04-15'), amount: 50000, mode: PaymentMode.UPI },
      { id: 'PAY002', date: new Date('2024-06-10'), amount: 30000, mode: PaymentMode.CARD },
    ],
  },
  {
    id: 'CE2024002',
    name: 'Diya Patel',
    guardianName: 'Mitesh Patel',
    contact: '9876543211',
    email: 'diya.patel@email.com',
    batch: 'NEET 2025',
    enrollmentDate: new Date('2024-05-01'),
    status: StudentStatus.ACTIVE,
    totalFees: 150000,
    discount: 0,
    payments: [
      { id: 'PAY003', date: new Date('2024-05-01'), amount: 75000, mode: PaymentMode.CHEQUE },
    ],
  },
  {
    id: 'CE2024003',
    name: 'Rohan Singh',
    guardianName: 'Sandeep Singh',
    contact: '9876543212',
    email: 'rohan.singh@email.com',
    batch: 'JEE Advanced 2024',
    enrollmentDate: new Date('2023-07-20'),
    status: StudentStatus.LEFT,
    totalFees: 180000,
    discount: 20000,
    payments: [
      { id: 'PAY004', date: new Date('2023-07-20'), amount: 80000, mode: PaymentMode.CASH },
      { id: 'PAY005', date: new Date('2023-10-15'), amount: 80000, mode: PaymentMode.UPI },
    ],
  },
  {
    id: 'CE2024004',
    name: 'Priya Verma',
    guardianName: 'Anil Verma',
    contact: '9876543213',
    email: 'priya.verma@email.com',
    batch: 'JEE Mains 2025',
    enrollmentDate: new Date('2024-04-20'),
    status: StudentStatus.ACTIVE,
    totalFees: 120000,
    discount: 5000,
    payments: [
        { id: 'PAY006', date: new Date('2024-04-20'), amount: 60000, mode: PaymentMode.CARD },
    ],
  },
];