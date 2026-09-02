import React from 'react';
import { Plus, Trash2, Eye } from 'lucide-react';
import { InfoTooltip } from './FormHelpers';

export const VisibilityConfig = ({
  masterFields = [],
  visLogicalOperator = 'AND',
  setVisLogicalOperator,
  visTargetField,
  setVisTargetField,
  visConditions = [],
  addVisibilityCondition,
  addVisCondition,
  updateVisibilityCondition,
  updateVisCondition,
  removeVisibilityCondition,
  removeVisCondition,
  generateFieldVisibilityFormula
}) => {
  const onAdd = addVisibilityCondition || addVisCondition || (() => {});
  const onUpdate = updateVisibilityCondition || updateVisCondition || (() => {});
  const onRemove = removeVisibilityCondition || removeVisCondition || (() => {});
  const operators = [
    { label: '== (Equals)', value: '==' },
    { label: '!= (Not Equals)', value: '!=' },
    { label: '> (Greater Than)', value: '>' },
    { label: '< (Less Than)', value: '<' },
    { label: '>= (Greater or Equal)', value: '>=' },
    { label: '<= (Less or Equal)', value: '<=' }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Conditional Visibility</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Write formulas to dynamically show or hide fields based on other column values.
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
        {/* Target Field Select */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              Field to Hide/Show
              <InfoTooltip text="This is the internal name of the column you want to dynamically show or hide on the SharePoint form." />
            </label>
            <select
              value={visTargetField}
              onChange={(e) => setVisTargetField(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-800 dark:text-slate-200"
            >
              {masterFields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.label} ({f.name})
                </option>
              ))}
            </select>
          </div>
          
          {/* Logical operator for compound conditions */}
          {visConditions.length > 1 && (
            <div className="w-full md:w-44">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                Combine with
                <InfoTooltip text="AND requires all conditions to be met. OR requires at least one condition to be met." />
              </label>
              <select
                value={visLogicalOperator}
                onChange={(e) => setVisLogicalOperator(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="AND">AND (All Conditions)</option>
                <option value="OR">OR (Any Condition)</option>
              </select>
            </div>
          )}
        </div>

        {/* Conditions Builder List */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
            Conditions ({visConditions.length})
          </label>
          
          <div className="space-y-3">
            {visConditions.map((cond, idx) => {
              const selectedField = masterFields.find(f => f.name === cond.field) || {};
              const isBoolean = selectedField.type === 'boolean';

              return (
                <div 
                  key={cond.id} 
                  className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-md shadow-sm relative"
                >
                  {/* Source Field */}
                  <div className="flex-1">
                    <select
                      value={cond.field}
                      onChange={(e) => onUpdate(cond.id, 'field', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200 font-medium"
                    >
                      {masterFields.map(f => (
                        <option key={f.name} value={f.name}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Operator */}
                  <div className="w-full md:w-36">
                    <select
                      value={cond.condition}
                      onChange={(e) => onUpdate(cond.id, 'condition', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200 font-medium font-mono"
                    >
                      {operators
                        .filter(op => !isBoolean || (op.value === '==' || op.value === '!='))
                        .map(op => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  {/* Comparison Value */}
                  <div className="flex-1 space-y-1">
                    {isBoolean ? (
                      <select
                        value={cond.value}
                        onChange={(e) => onUpdate(cond.id, 'value', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={cond.value}
                          onChange={(e) => onUpdate(cond.id, 'value', e.target.value)}
                          placeholder="Compare Value (e.g. Completed, @me)"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-slate-400 select-none font-medium">Tokens:</span>
                          <button
                            type="button"
                            onClick={() => onUpdate(cond.id, 'value', '@me')}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                              cond.value === '@me'
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                            title="Current User token (unquoted in SharePoint, matches current signed-in user)"
                          >
                            👤 @me
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdate(cond.id, 'value', '@now')}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                              cond.value === '@now'
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                            title="Current Date token (unquoted in SharePoint, evaluates to today's date)"
                          >
                            📅 @now
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdate(cond.id, 'value', "''")}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                              cond.value === "''" || cond.value === ''
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                            title="Empty / blank check (tests if column is empty or unselected)"
                          >
                            ∅ '' (Empty)
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Delete Condition Button */}
                  <button
                    onClick={() => onRemove(cond.id)}
                    disabled={visConditions.length === 1}
                    className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 self-start md:self-center"
                    title="Delete condition criteria"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Condition Button */}
          <button
            onClick={onAdd}
            className="flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl font-semibold transition-all shadow-2xs border border-slate-200 dark:border-slate-700"
          >
            <Plus size={13} /> Add Condition Criteria
          </button>
        </div>
      </div>

      {/* Helper Documentation Box */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Generated Formula</label>
        <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap break-all shadow-2xs">
          {generateFieldVisibilityFormula() || '—'}
        </pre>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1 pt-1">
          <p>
            <strong>Where to paste:</strong> In your SharePoint list form, click <em>Configure layout &rarr; Edit columns &rarr;</em> click the target column &rarr; <em>Edit formula</em>.
          </p>
          <p>
            <strong>Smart Tokens:</strong> <code className="font-mono text-[10px] bg-slate-200/80 dark:bg-slate-800 px-1 py-0.5 rounded">@me</code> resolves to the current user's email/login, <code className="font-mono text-[10px] bg-slate-200/80 dark:bg-slate-800 px-1 py-0.5 rounded">@now</code> compares against today's date, and <code className="font-mono text-[10px] bg-slate-200/80 dark:bg-slate-800 px-1 py-0.5 rounded">''</code> checks for empty values.
          </p>
        </div>
      </div>

      {/* Helper Documentation Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded-lg text-xs space-y-2 text-slate-700 dark:text-slate-300">
        <h3 className="font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
          <Eye size={14} /> Conditional Formula Instructions
        </h3>
        <p>
          SharePoint modern list forms allow you to hide or show columns based on simple Excel-like conditional statements. 
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Text / single choice fields:</strong> Wrap values in single quotes (e.g., <code>'Completed'</code>).</li>
          <li><strong>Boolean (Yes/No):</strong> Check against <code>true</code> or <code>false</code>.</li>
          <li><strong>Empty checks:</strong> Check if a field equals blank single quotes (e.g., <code>== ''</code>).</li>
          <li><strong>Current User:</strong> Check against the current user email using the <code>@me</code> keyword.</li>
        </ul>
      </div>
    </div>
  );
};
