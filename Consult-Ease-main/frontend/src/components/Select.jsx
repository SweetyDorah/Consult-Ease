import React from 'react';

const Select = ({ icon: Icon, id, name, value, onChange, required, children }) => {
  return (
    <div className="input-container">
      <div className="input-icon">
        <Icon className="icon" />
      </div>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="input-form-field"
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
