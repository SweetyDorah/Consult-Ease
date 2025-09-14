import "./componentStyles.css";

const FormInput = ({ icon: Icon, type, ...props }) => {
  return (
    <div className="input-container">
      {Icon && (
        <div className="input-icon">
          <Icon className="icon" />
        </div>
      )}
      <input
        {...props}
        type={type}
        className="input-form-field"
      />
    </div>
  );
};

export default FormInput;
