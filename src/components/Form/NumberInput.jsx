import { forwardRef } from 'react';
import { getFieldConfig, getLabelClassName } from '../../config/commonFields';

const NumberInput = forwardRef(({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false,
  className = '',
  min,
  max,
  step,
  ...props 
}, ref) => {
  const fieldConfig = getFieldConfig('number');
  
  return (
    <div>
      {label && (
        <label htmlFor={name} className={getLabelClassName(required)}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type="number"
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder || fieldConfig.placeholder(label || '')}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`${fieldConfig.className} ${className}`}
        {...props}
      />
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;

