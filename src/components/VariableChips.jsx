import React from 'react';

export const VariableChips = ({ onInsert }) => {
  const vars = ['[$Title]', '[$Created]', '[$Modified]', '[$Author.title]', '[$Editor.title]', '@me'];

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center mr-1">Insert:</span>
      {vars.map(v => (
        <button
          key={v}
          type="button"
          onClick={() => onInsert(v)}
          className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 transition-colors font-mono"
        >
          {v}
        </button>
      ))}
    </div>
  );
};
