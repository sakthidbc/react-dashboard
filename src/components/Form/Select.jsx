import { forwardRef } from 'react';
import { getLabelClassName } from '../../config/commonFields';

const Select = forwardRef(({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Select an option',
  ...props 
}, ref) => {
  const selectClassName = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";
  
  return (
    <div>
      {label && (
        <label htmlFor={name} className={getLabelClassName(required)}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={`${selectClassName} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value || option.id || option} value={option.value || option.id || option}>
            {option.label || option.name || option}
          </option>
        ))}
      </select>
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

