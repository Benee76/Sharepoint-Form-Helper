import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { isValidHex } from '../lib/formUtils';

export const ColorPicker = ({ value, onChange, label }) => {
  const colorValue = isValidHex(value) ? value : '#000000';

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded border border-slate-300 dark:border-slate-600 shadow-inner relative overflow-hidden flex-shrink-0" style={{ backgroundColor: colorValue }}>
          <input
            type="color"
            value={colorValue}
            onChange={onChange}
            aria-label={label}
            className="absolute inset-[-50%] w-[200%] h-[200%] opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={onChange}
          spellCheck={false}
          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 text-sm uppercase font-mono text-slate-800 dark:text-slate-200"
        />
      </div>
    </div>
  );
};

export const InfoTooltip = ({ text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1">
      <HelpCircle
        size={13}
        className="text-slate-400 cursor-help hover:text-blue-500 transition-colors"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        tabIndex={0}
        role="img"
        aria-label={text}
      />
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs p-2.5 rounded-lg w-64 z-50 text-center shadow-xl font-sans font-normal pointer-events-none border border-slate-800">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};
