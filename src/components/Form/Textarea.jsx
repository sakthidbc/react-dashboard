import { forwardRef } from 'react';
import { getFieldConfig, getLabelClassName } from '../../config/commonFields';

const Textarea = forwardRef(({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false,
  className = '',
  rows = 4,
  ...props 
}, ref) => {
  const fieldConfig = getFieldConfig('textarea');
  
  return (
    <div>
      {label && (
        <label htmlFor={name} className={getLabelClassName(required)}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder || fieldConfig.placeholder(label || '')}
        disabled={disabled}
        rows={rows || fieldConfig.rows}
        className={`${fieldConfig.className} ${className}`}
        {...props}
      />
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;

