const Radio = ({
  label,
  name,
  value,
  checked,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="flex items-center cursor-pointer">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked || false}
          onChange={onChange}
          disabled={disabled}
          className={`w-4 h-4 text-primary border-gray-300 focus:ring-primary focus:ring-2 ${
            error ? 'border-red-500' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          {...props}
        />
        {label && (
          <span className={`ml-2 text-sm text-gray-700 dark:text-gray-300 ${disabled ? 'opacity-50' : ''}`}>
            {label}
          </span>
        )}
      </label>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Radio;

