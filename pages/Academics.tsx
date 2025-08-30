
import React from 'react';

export const Academics: React.FC = () => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-bold text-text-primary mb-4">Academics & Faculty Management</h2>
      <p className="text-text-secondary">This module is under construction.</p>
      <div className="mt-8 space-y-4 text-left max-w-md mx-auto">
        <p className="text-text-primary font-semibold">Future features will include:</p>
        <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>Timetable scheduling with calendar view</li>
            <li>Faculty allocation and teaching hours tracking</li>
            <li>Study material upload (PDF, PPT, Video)</li>
            <li>Test/exam scheduling and grading</li>
            <li>Performance analysis dashboards</li>
        </ul>
      </div>
    </div>
  );
};
