import { memo } from 'react';

const InputField = ({
  value,
  onChange,
  placeholder = '',
  label = null,
  type = 'text',
  autoFocus = false,
  onKeyDown,
  className = '',
  containerClassName = ''
}) => {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-bold text-brand-light uppercase tracking-wider ml-1 block">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        className={`w-full p-3 border-2 border-brand-light/10 rounded-xl focus:border-brand-cyan focus:outline-none bg-glass text-brand-light placeholder-brand-wood/40 font-bold ${className}`}
      />
    </div>
  );
};

export default memo(InputField);
