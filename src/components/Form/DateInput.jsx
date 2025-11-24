import { forwardRef } from 'react';
import { getFieldConfig, getLabelClassName } from '../../config/commonFields';

const DateInput = forwardRef(({ 
  label, 
  name, 
  value, 
  onChange, 
  required = false,
  disabled = false,
  className = '',
  type = 'date',
  ...props 
}, ref) => {
  const fieldConfig = getFieldConfig(type);
  
  return (
    <div>
      {label && (
        <label htmlFor={name} className={getLabelClassName(required)}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={`${fieldConfig.className} ${className}`}
        {...props}
      />
    </div>
  );
});

DateInput.displayName = 'DateInput';

export default DateInput;

