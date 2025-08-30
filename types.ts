export enum StudentStatus {
  ACTIVE = 'Active',
  LEFT = 'Left',
}

export enum PaymentMode {
  CASH = 'Cash',
  CARD = 'Card',
  UPI = 'UPI',
  CHEQUE = 'Cheque',
}

export interface Payment {
  id: string;
  date: Date;
  amount: number;
  mode: PaymentMode;
  referenceImage?: string; 
}

export interface Student {
  id: string; 
  name: string;
  guardianName: string;
  contact: string;
  email: string;
  batch: string;
  enrollmentDate: Date;
  status: StudentStatus;
  totalFees: number;
  discount: number;
  payments: Payment[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export enum Page {
    DASHBOARD = 'Dashboard',
    STUDENTS = 'Student Management',
    FEES = 'Fee Management',
    SETTINGS = 'Settings'
}

export enum SyncStatus {
    IDLE = 'Idle',
    SYNCING = 'Syncing',
    SYNCED = 'Synced',
    ERROR = 'Error',
}