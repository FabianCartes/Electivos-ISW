import React from 'react';

const Card = ({ children, className = '', ...rest }) => {
  return (
    <div
      className={`bg-white shadow-sm border border-gray-200 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
