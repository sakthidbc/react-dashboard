/**
 * Common field configurations that can be reused across modules
 * This ensures consistent field designs and behaviors
 */

export const commonFields = {
  // Standard text input
  text: {
    className: "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
    placeholder: (label) => `Enter ${label.toLowerCase()}`,
  },
  
  // Email input
  email: {
    className: "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
    placeholder: (label) => `Enter ${label.toLowerCase()}`,
  },
  
  // URL input
  url: {
    className: "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
    placeholder: (label) => `Enter ${label.toLowerCase()}`,
  },
  
  // Number input
  number: {
    className: "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
    placeholder: (label) => `Enter ${label.toLowerCase()}`,
  },
  
  // Textarea
  textarea: {
    className: "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
    rows: 4,
    placeholder: (label) => `Enter ${label.toLowerCase()}`,
  },
  
  // Date input
  date: {
    className: "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
  },
  
  // DateTime input
  datetime: {
    className: "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
  },
  
  // Boolean/Radio buttons
  boolean: {
    containerClassName: "flex items-center gap-6",
    radioClassName: "w-4 h-4 text-primary focus:ring-primary border-gray-300",
    labelClassName: "text-sm font-medium text-gray-700 dark:text-gray-300",
  },
  
  // Image upload
  image: {
    uploadAreaClassName: "border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer",
    previewContainerClassName: "relative group w-full h-48 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden",
    buttonClassName: "opacity-0 group-hover:opacity-100 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all text-sm",
    removeButtonClassName: "opacity-0 group-hover:opacity-100 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm",
  },
  
  // File upload
  file: {
    uploadAreaClassName: "border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer",
    fileContainerClassName: "border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50",
    buttonClassName: "px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors",
  },
  
  // Label styles
  label: {
    className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
    requiredClassName: "text-red-500",
  },
  
  // Status field
  status: {
    containerClassName: "flex items-center gap-6",
    radioClassName: "w-5 h-5 text-primary focus:ring-primary cursor-pointer",
    labelClassName: "text-gray-700 dark:text-gray-300 font-medium group-hover:text-primary transition-colors",
  },
};

/**
 * Get field configuration for a specific field type
 */
export const getFieldConfig = (fieldType) => {
  return commonFields[fieldType] || commonFields.text;
};

/**
 * Get label class name with required indicator
 */
export const getLabelClassName = (required = false) => {
  return `${commonFields.label.className} ${required ? commonFields.label.requiredClassName : ''}`;
};

