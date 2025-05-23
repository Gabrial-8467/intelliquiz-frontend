import React from 'react';
import '../style/components.css'; 

export const Button = ({ onClick, children }) => {
  return (
    <button className="btn-btn-primary" onClick={onClick}>
      {children}
    </button>
  );
};
