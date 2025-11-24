import { forwardRef } from 'react';
import { getFieldConfig, getLabelClassName } from '../../config/commonFields';

const TextInput = forwardRef(({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false,
  className = '',
  type = 'text',
  ...props 
}, ref) => {
  const fieldConfig = getFieldConfig(type === 'email' ? 'email' : type === 'url' ? 'url' : 'text');
  
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
        placeholder={placeholder || fieldConfig.placeholder(label || '')}
        disabled={disabled}
        className={`${fieldConfig.className} ${className}`}
        {...props}
      />
    </div>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;

