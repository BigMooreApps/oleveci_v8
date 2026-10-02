import React from 'react';

interface TagSlashIconProps {
  className?: string;
}

export const TagSlashIcon: React.FC<TagSlashIconProps> = ({ className = 'w-4 h-4' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Tag outline */}
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      {/* Tag hole */}
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
      {/* Diagonal slash across the tag */}
      <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2.5" />
    </svg>
  );
};

export default TagSlashIcon;
