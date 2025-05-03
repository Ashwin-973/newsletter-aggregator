import { useRef, useEffect, useState } from 'react';

export const SegmentedControl = ({
  options = ["All","Read","Unread"],
  defaultValue,
  onChange,
  className = '',
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue || options[0]);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const controlRef = useRef(null);
  const segmentRefs = useRef([]);

  useEffect(() => {
    updateIndicatorPosition();
    window.addEventListener('resize', updateIndicatorPosition);
    return () => window.removeEventListener('resize', updateIndicatorPosition);
  }, [selectedValue]);

  const updateIndicatorPosition = () => {
    const selectedIndex = options.indexOf(selectedValue);
    const selectedSegment = segmentRefs.current[selectedIndex];
    
    if (selectedSegment && controlRef.current) {
      const control = controlRef.current;
      const segment = selectedSegment;
      const controlRect = control.getBoundingClientRect();
      const segmentRect = segment.getBoundingClientRect();

      setIndicatorStyle({
        left: `${segmentRect.left - controlRect.left}px`,
        width: `${segmentRect.width}px`,
      });
    }
  };

  const handleSegmentClick = (value) => {
    setSelectedValue(value);
    onChange?.(value);
  };

  const handleKeyDown = (e, value) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSegmentClick(value);
    }
  };

  return (
    <div
      className={`relative p-1 bg-gray-100 rounded-lg dark:bg-gray-800 ${className}`}
      ref={controlRef}
      role="tablist"
      aria-label="Message filter"
    >
      {/* Active segment indicator */}
      <div
        className="absolute h-[calc(100%-8px)] top-1 bg-white rounded-md shadow-sm transition-all duration-200 ease-in-out dark:bg-gray-700"
        style={indicatorStyle}
        aria-hidden="true"
      />

      {/* Segments */}
      <div className="relative flex">
        {options.map((option, index) => (
          <button
            key={option}
            ref={(el) => (segmentRefs.current[index] = el)}
            role="tab"
            aria-selected={selectedValue === option}
            aria-controls={`panel-${option}`}
            className={`
              flex-1 px-4 py-2 min-h-[28px] text-sm font-medium rounded-md
              transition-colors duration-200
              focus:outline-none
              ${selectedValue === option
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }
            `}
            onClick={() => handleSegmentClick(option)}
            onKeyDown={(e) => handleKeyDown(e, option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

