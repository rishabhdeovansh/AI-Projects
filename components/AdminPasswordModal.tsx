
import React, { useState } from 'react';
import { Modal } from './Modal';
import { ADMIN_PASSWORD } from '../constants';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionDescription: string;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ isOpen, onClose, onSuccess, actionDescription }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (password === ADMIN_PASSWORD) {
      setError('');
      setPassword('');
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleClose = () => {
      setPassword('');
      setError('');
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Admin Approval Required">
      <div className="space-y-4">
        <p className="text-text-secondary">
          To proceed with the action: <strong className="text-text-primary">"{actionDescription}"</strong>, please enter the admin password.
        </p>
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-text-secondary mb-1">
            Admin Password
          </label>
          <input
            type="password"
            id="admin-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Enter password"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors"
          >
            Verify & Proceed
          </button>
        </div>
      </div>
    </Modal>
  );
};
