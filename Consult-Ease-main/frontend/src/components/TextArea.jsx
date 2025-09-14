export const TextArea = ({ icon: Icon, id, name, placeholder, maxLength, value, onChange, required }) => {
  return (
    <div className="input-container">
      <div className="input-icon">
        <Icon className="icon" />
      </div>
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        required={required}
        className="input-form-field"
        rows={2}
      ></textarea>
    </div>
  );
};