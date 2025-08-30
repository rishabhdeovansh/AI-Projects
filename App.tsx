import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { StudentManagement } from './pages/StudentManagement';
import { FeeManagement } from './pages/FeeManagement';
import { Settings } from './pages/Settings';
import type { Student, Payment, TeamMember } from './types';
import { Page, SyncStatus } from './types';
import { initialStudents, initialBatches, initialTeamMembers, GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_SCOPES, DRIVE_FILE_NAME } from './constants';

declare var gapi: any;
declare var google: any;

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.DASHBOARD);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(students[0] || null);
  const [profilePicture, setProfilePicture] = useState<string>('https://picsum.photos/40/40');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [batches, setBatches] = useState<string[]>(initialBatches);

  // Google Drive Sync State
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.IDLE);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [isGisReady, setIsGisReady] = useState(false);

  const tokenClient = useRef<any>(null);

  const addStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };
  
  const addStudentsBatch = (newStudents: Student[]) => {
    setStudents(prev => [...prev, ...newStudents]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    if (selectedStudent?.id === updatedStudent.id) {
        setSelectedStudent(updatedStudent);
    }
  };

  const addPayment = useCallback((studentId: string, payment: Omit<Payment, 'id' | 'date'>) => {
    const newPayment: Payment = {
        ...payment,
        id: `PAY${Date.now()}`,
        date: new Date(),
    };
    const updatedStudents = students.map(student => {
        if (student.id === studentId) {
            return {
                ...student,
                payments: [...student.payments, newPayment],
            };
        }
        return student;
    });
    setStudents(updatedStudents);
    const updatedSelectedStudent = updatedStudents.find(s => s.id === studentId);
    if(updatedSelectedStudent) {
        setSelectedStudent(updatedSelectedStudent);
    }
  }, [students]);
  
  const addPaymentBatch = useCallback((studentId: string, payments: Omit<Payment, 'id' | 'date'>[]) => {
      const updatedStudents = students.map(student => {
        if (student.id === studentId) {
            const newPayments: Payment[] = payments.map(p => ({
                ...p,
                id: `PAY${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
                date: new Date(),
            }));
            return {
                ...student,
                payments: [...student.payments, ...newPayments],
            };
        }
        return student;
    });
    setStudents(updatedStudents);
    if (selectedStudent?.id === studentId) {
        const updatedSelectedStudent = updatedStudents.find(s => s.id === studentId);
        if(updatedSelectedStudent) {
            setSelectedStudent(updatedSelectedStudent);
        }
    }
  }, [students]);

  const addTeamMember = (teamMember: Omit<TeamMember, 'id'>) => {
    setTeamMembers(prev => [...prev, { ...teamMember, id: `TM${Date.now()}` }]);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(tm => tm.id !== id));
  };

  const addBatch = (batch: string) => {
    if (batch && !batches.includes(batch)) {
        setBatches(prev => [...prev, batch]);
    }
  };

  const removeBatch = (batch: string) => {
    setBatches(prev => prev.filter(b => b !== batch));
  };

  // --- Google Drive Sync Logic ---

  const getAppState = useCallback(() => ({
      students, teamMembers, batches, profilePicture
  }), [students, teamMembers, batches, profilePicture]);

  const loadAppState = useCallback((state: any) => {
    if (state.students) setStudents(state.students.map((s: any) => ({...s, enrollmentDate: new Date(s.enrollmentDate), payments: s.payments.map((p:any) => ({...p, date: new Date(p.date)}))})));
    if (state.teamMembers) setTeamMembers(state.teamMembers);
    if (state.batches) setBatches(state.batches);
    if (state.profilePicture) setProfilePicture(state.profilePicture);
  }, []);

  useEffect(() => {
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onload = () => {
        gapi.load('client', async () => {
            await gapi.client.init({
                apiKey: GOOGLE_API_KEY,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            });
            setIsGapiReady(true);
        });
    };
    document.body.appendChild(gapiScript);

    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = () => {
        tokenClient.current = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: GOOGLE_SCOPES,
            callback: (resp: any) => {
                if (resp.error !== undefined) throw (resp);
                setIsSignedIn(true);
            },
        });
        setIsGisReady(true);
    };
    document.body.appendChild(gisScript);
  }, []);
  
  const handleAuthClick = () => {
    if (tokenClient.current) {
        tokenClient.current.requestAccessToken({ prompt: 'consent' });
    }
  };

  const handleSignoutClick = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken('');
            setIsSignedIn(false);
            setSyncStatus(SyncStatus.IDLE);
            setLastSynced(null);
            setDriveFileId(null);
        });
    }
  };
  
  const syncDataWithDrive = useCallback(async (isInitialLoad = false) => {
    if (!gapi.client?.drive) return;
    setSyncStatus(SyncStatus.SYNCING);
    try {
        let fileId = driveFileId;
        if (!fileId) {
            const searchResponse = await gapi.client.drive.files.list({
                q: `name='${DRIVE_FILE_NAME}' and trashed=false`,
                fields: 'files(id, name)', spaces: 'drive',
            });
            if (searchResponse.result.files.length > 0) {
                fileId = searchResponse.result.files[0].id;
                setDriveFileId(fileId);
            }
        }
        
        if (fileId) {
            if (isInitialLoad) {
                const fileGetResponse = await gapi.client.drive.files.get({ fileId: fileId, alt: 'media' });
                loadAppState(JSON.parse(fileGetResponse.body));
            } else {
                await gapi.client.request({
                    path: `/upload/drive/v3/files/${fileId}`, method: 'PATCH',
                    params: { uploadType: 'media' }, body: JSON.stringify(getAppState()),
                });
            }
        } else {
            const appStateString = JSON.stringify(getAppState());
            const createResponse = await gapi.client.drive.files.create({
                resource: { name: DRIVE_FILE_NAME, mimeType: 'application/json' }, fields: 'id',
            });
            fileId = createResponse.result.id;
            setDriveFileId(fileId);
            await gapi.client.request({
                path: `/upload/drive/v3/files/${fileId}`, method: 'POST',
                params: { uploadType: 'media' }, body: appStateString,
            });
        }
        setSyncStatus(SyncStatus.SYNCED);
        setLastSynced(new Date());
    } catch (error) {
        console.error('Error syncing with Google Drive:', error);
        setSyncStatus(SyncStatus.ERROR);
        if((error as any)?.result?.error?.code === 401) handleSignoutClick();
    }
  }, [driveFileId, getAppState, loadAppState]);

  useEffect(() => {
    if (isSignedIn && isGapiReady) {
        syncDataWithDrive(true);
    }
  }, [isSignedIn, isGapiReady]);

  useEffect(() => {
    if (isSignedIn && syncStatus !== SyncStatus.SYNCING && isGapiReady) {
        const handler = setTimeout(() => syncDataWithDrive(false), 2000);
        return () => clearTimeout(handler);
    }
  }, [students, teamMembers, batches, profilePicture, isSignedIn, syncStatus, isGapiReady, syncDataWithDrive]);


  const renderPage = () => {
    switch (activePage) {
      case Page.DASHBOARD:
        return <Dashboard students={students} />;
      case Page.STUDENTS:
        return <StudentManagement students={students} addStudent={addStudent} updateStudent={updateStudent} batches={batches} addStudentsBatch={addStudentsBatch} />;
      case Page.FEES:
        return <FeeManagement students={students} selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent} addPayment={addPayment} addPaymentBatch={addPaymentBatch} />;
      case Page.SETTINGS:
        return <Settings 
                    teamMembers={teamMembers} addTeamMember={addTeamMember} removeTeamMember={removeTeamMember} 
                    batches={batches} addBatch={addBatch} removeBatch={removeBatch}
                    isSignedIn={isSignedIn} syncStatus={syncStatus} lastSynced={lastSynced}
                    onConnect={handleAuthClick} onDisconnect={handleSignoutClick} onSync={() => syncDataWithDrive(false)}
                    isGapiReady={isGapiReady && isGisReady}
                />;
      default:
        return <Dashboard students={students}/>;
    }
  };

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header profilePicture={profilePicture} setProfilePicture={setProfilePicture} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;