
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center px-6 py-3 border border-transparent 
        text-base font-medium rounded-md text-white 
        bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-accent
        transition-all duration-300 transform
        disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none
        shadow-lg hover:shadow-glow
        ${className}
      `}
    >
      {children}
    </button>
  );
};
