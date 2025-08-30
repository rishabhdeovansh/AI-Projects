import React, { useRef } from 'react';

interface HeaderProps {
    profilePicture: string;
    setProfilePicture: (pic: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ profilePicture, setProfilePicture }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className="bg-sidebar p-4 shadow-md flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Welcome, Admin!</h1>
        <p className="text-sm text-text-secondary">Here's your institute's overview.</p>
      </div>
      <div className="flex items-center space-x-4">
         <div className="relative">
            <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a2 2 0 00-4 0v.083A6 6 0 004 11v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"></path></svg>
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </div>
        <div className="flex items-center space-x-2">
            <div className="relative group cursor-pointer" onClick={triggerFileSelect} aria-label="Change profile picture">
                <img src={profilePicture} alt="Admin" className="w-10 h-10 rounded-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white opacity-0 group-hover:opacity-100" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} accept="image/*" className="hidden" />
            </div>
          <div>
            <p className="font-semibold text-text-primary">Admin User</p>
            <p className="text-xs text-text-secondary">System Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};