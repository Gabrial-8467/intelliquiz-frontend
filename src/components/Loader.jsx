import React from 'react';
import "../style/components.css";

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="loader">
        <div className="loader-square" />
        <div className="loader-square" />
        <div className="loader-square" />
        <div className="loader-square" />
        <div className="loader-square" />
        <div className="loader-square" />
        <div className="loader-square" />
        <div className="loader-square" />
      </div>
    </div>
  );
};

export default Loader;
