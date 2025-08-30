import React, { useState } from 'react';
import { AdminPasswordModal } from '../components/AdminPasswordModal';
import type { TeamMember } from '../types';
import { SyncStatus } from '../types';

interface SettingsProps {
  teamMembers: TeamMember[];
  addTeamMember: (teamMember: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  batches: string[];
  addBatch: (batch: string) => void;
  removeBatch: (batch: string) => void;
  isSignedIn: boolean;
  syncStatus: SyncStatus;
  lastSynced: Date | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  isGapiReady: boolean;
}

const SyncStatusIndicator: React.FC<{ status: SyncStatus }> = ({ status }) => {
    switch (status) {
        case SyncStatus.SYNCING:
            return <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>;
        case SyncStatus.SYNCED:
            return <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
        case SyncStatus.ERROR:
            return <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        default:
            return <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
}

export const Settings: React.FC<SettingsProps> = ({
  teamMembers, addTeamMember, removeTeamMember,
  batches, addBatch, removeBatch,
  isSignedIn, syncStatus, lastSynced, onConnect, onDisconnect, onSync, isGapiReady
}) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [settingsUnlocked, setSettingsUnlocked] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '' });
  const [newBatch, setNewBatch] = useState('');

  const handlePasswordSuccess = () => {
    setSettingsUnlocked(true);
    setIsPasswordModalOpen(false);
  };

  const handleAddTeamMember = () => {
    if (newTeamMember.name && newTeamMember.role) {
      addTeamMember(newTeamMember);
      setNewTeamMember({ name: '', role: '' });
    }
  };

  const handleAddBatch = () => {
    if (newBatch.trim()) {
      addBatch(newBatch.trim());
      setNewBatch('');
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-text-primary mb-6">System Settings</h2>
      
      {!settingsUnlocked ? (
        <div className="text-center p-8 border-2 border-dashed border-border rounded-lg">
          <h3 className="text-xl font-semibold text-text-primary">Admin Area Locked</h3>
          <p className="text-text-secondary mt-2 mb-4">
            To modify system settings, you need to provide admin credentials.
          </p>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Unlock Settings
          </button>
        </div>
      ) : (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Manage Batches (Subheads)</h3>
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                      {batches.map(batch => (
                          <div key={batch} className="flex justify-between items-center bg-background p-2 rounded">
                              <span>{batch}</span>
                              <button onClick={() => removeBatch(batch)} className="text-red-500 hover:text-red-400 text-xs font-bold">REMOVE</button>
                          </div>
                      ))}
                  </div>
                  <div className="flex space-x-2">
                      <input type="text" value={newBatch} onChange={e => setNewBatch(e.target.value)} placeholder="New Batch Name" className="flex-grow p-2 bg-background border border-border rounded" />
                      <button onClick={handleAddBatch} className="bg-secondary hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded">Add</button>
                  </div>
              </div>
              
              <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Manage Team Members</h3>
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                      {teamMembers.map(tm => (
                          <div key={tm.id} className="flex justify-between items-center bg-background p-2 rounded">
                              <div>
                                  <p className="font-semibold">{tm.name}</p>
                                  <p className="text-xs text-text-secondary">{tm.role}</p>
                              </div>
                              <button onClick={() => removeTeamMember(tm.id)} className="text-red-500 hover:text-red-400 text-xs font-bold">REMOVE</button>
                          </div>
                      ))}
                  </div>
                  <div className="flex space-x-2">
                      <input type="text" value={newTeamMember.name} onChange={e => setNewTeamMember(p => ({...p, name: e.target.value}))} placeholder="Member Name" className="flex-grow p-2 bg-background border border-border rounded" />
                      <input type="text" value={newTeamMember.role} onChange={e => setNewTeamMember(p => ({...p, role: e.target.value}))} placeholder="Member Role" className="flex-grow p-2 bg-background border border-border rounded" />
                      <button onClick={handleAddTeamMember} className="bg-secondary hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded">Add</button>
                  </div>
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Data Storage & Sync</h3>
               {!isGapiReady ? (
                 <p className="text-text-secondary">Initializing Google Services...</p>
               ) : !isSignedIn ? (
                <>
                  <p className="text-text-secondary mb-4">Save and sync all ERP data with your Google Drive for secure, cloud-based access.</p>
                  <button onClick={onConnect} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center space-x-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5,8.25h-9l-3,5.25h15Zm-4.875,3h-2.25L8.25,13.5h7.5Z M21.75,6H16.5L12,0L7.5,6H2.25A2.25,2.25,0,0,0,0,8.25v11.25A2.25,2.25,0,0,0,2.25,21.75h19.5A2.25,2.25,0,0,0,24,19.5V8.25A2.25,2.25,0,0,0,21.75,6Z"></path></svg>
                      <span>Connect to Google Drive & Sheets</span>
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 bg-background p-3 rounded-lg">
                      <SyncStatusIndicator status={syncStatus} />
                      <div className="flex-grow">
                          <p className="font-semibold text-text-primary">Sync Status: {syncStatus}</p>
                          <p className="text-xs text-text-secondary">
                              {lastSynced ? `Last sync: ${lastSynced.toLocaleString()}` : 'Ready to sync.'}
                          </p>
                      </div>
                  </div>
                  <div className="flex items-center space-x-3">
                      <button onClick={onSync} disabled={syncStatus === SyncStatus.SYNCING} className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                          {syncStatus === SyncStatus.SYNCING ? 'Syncing...' : 'Sync Now'}
                      </button>
                      <button onClick={onDisconnect} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors">
                          Disconnect
                      </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
                onClick={() => setSettingsUnlocked(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors mt-4"
              >
                Lock Settings
            </button>
        </div>
      )}

      <AdminPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
        actionDescription="Access System Settings"
      />
    </div>
  );
};