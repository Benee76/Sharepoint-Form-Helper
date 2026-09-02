import React, { useState, useEffect } from 'react';
import { 
  LayoutTemplate, 
  Info, 
  Settings, 
  AlertCircle, 
  Check, 
  Mail, 
  User, 
  Calendar, 
  FileText, 
  Link as LinkIcon, 
  ExternalLink,
  Monitor,
  Smartphone,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter
} from 'lucide-react';
import { COMMAND_LABELS } from '../lib/formUtils';

export const FormPreview = ({
  headerContainers,
  bodySections,
  footerContainers,
  hiddenCommands,
  commandConfigs = {},
  customCommands = [],
  visTargetField,
  visLogicalOperator,
  visConditions,
  masterFields
}) => {
  const [viewport, setViewport] = useState('desktop');
  const [showFormulaInspector, setShowFormulaInspector] = useState(false);
  const [showCommandBarPreview, setShowCommandBarPreview] = useState(false);

  // --- Mock Fields State ---
  const [mockValues, setMockValues] = useState({
    Title: 'Sample Request Item',
    Status: 'New',
    Priority: 'Medium',
    AssignedTo: 'Alexander Pierce',
    Description: 'This is a sample SharePoint item description for testing.',
    StartDate: '2026-06-24',
    DueDate: '2026-07-10',
    Created: '2026-06-24',
    Modified: '2026-06-24',
    Author: { title: 'Alexander Pierce' },
    Editor: { title: 'Sarah Connor' }
  });

  useEffect(() => {
    setMockValues((prev) => {
      const updated = { ...prev };
      let changed = false;
      masterFields.forEach((f) => {
        if (updated[f.name] === undefined) {
          if (f.type === 'boolean') updated[f.name] = false;
          else if (f.type === 'number') updated[f.name] = 0;
          else if (f.type === 'user') updated[f.name] = '';
          else updated[f.name] = '';
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [masterFields]);

  // --- Handlers ---
  const handleValChange = (field, value) => {
    setMockValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // --- Expression Evaluator ---
  const evaluateExpression = (expr, values) => {
    if (expr === null || expr === undefined || expr === '') return '';
    if (typeof expr !== 'string') return String(expr);
    if (!expr.trim().startsWith('=')) return expr;

    let formula = expr.trim().substring(1).trim();

    // Tokenizer to replace [$Field] and @me with values
    const replaceTokens = (str) => {
      let res = str.replace(/\[\$([^\]]+)\]/g, (match, tokenName) => {
        // Handle subproperties like [$Author.title]
        const parts = tokenName.split('.');
        const baseField = parts[0];
        const subProp = parts[1];

        let val = values[baseField];
        if (val && typeof val === 'object') {
          val = subProp ? val[subProp] : (val.title ?? val.name ?? val.value ?? '');
        }

        if (val === undefined || val === null) return "''";
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'number') return val;
        const escaped = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `'${escaped}'`;
      });

      // Also support @me
      res = res.replace(/(^|[^a-zA-Z0-9_$])@me\b/g, (m, prefix) => {
        return `${prefix}'currentuser@company.com'`;
      });

      return res;
    };

    try {
      let jsExpr = formula;
      let changed = true;

      // Recursive Logic Parser for AND, OR, if
      let safetyCounter = 0;
      while (changed && safetyCounter++ < 20) {
        const prev = jsExpr;
        
        // Match AND(a, b, ...)
        jsExpr = jsExpr.replace(/AND\(([^)]+)\)/gi, (m, args) => {
          return `(${args.split(',').join(' && ')})`;
        });

        // Match OR(a, b, ...)
        jsExpr = jsExpr.replace(/OR\(([^)]+)\)/gi, (m, args) => {
          return `(${args.split(',').join(' || ')})`;
        });

        // Match if(cond, trueVal, falseVal)
        jsExpr = jsExpr.replace(/if\(([^,]+),([^,]+),([^)]+)\)/gi, (m, cond, tVal, fVal) => {
          return `((${cond}) ? (${tVal}) : (${fVal}))`;
        });

        if (prev === jsExpr) changed = false;
      }

      jsExpr = replaceTokens(jsExpr);

      // Evaluate the sanitized expression
      const result = new Function(`return (${jsExpr});`)();
      return result !== undefined && result !== null ? result : '';
    } catch (e) {
      // In case of syntax failures during partial typings, return empty
      return '';
    }
  };

  const isVisible = (expr) => {
    if (!expr || expr === '') return true;
    const res = evaluateExpression(expr, mockValues);
    if (res === 'none' || res === 'false' || res === false || res === 0 || res === '0') return false;
    return true;
  };

  // --- Target Field Visibility Calculation with Debug Diagnostics ---
  const getVisibilityDiagnostics = () => {
    if (!visConditions || visConditions.length === 0 || !visTargetField) {
      return { hasRules: false, isVisible: true, breakdown: [] };
    }

    const breakdown = visConditions.map(cond => {
      const sourceValRaw = mockValues[cond.field];
      const sourceVal = (sourceValRaw && typeof sourceValRaw === 'object') ? (sourceValRaw.title ?? '') : (sourceValRaw ?? '');
      const compVal = cond.value ?? '';

      let isMatch = false;
      if (cond.type === 'boolean') {
        const bSourceVal = sourceVal === true || sourceVal === 'true';
        const bCompVal = compVal === true || compVal === 'true';
        isMatch = cond.condition === '==' ? (bSourceVal === bCompVal) : (bSourceVal !== bCompVal);
      } else {
        let sSourceVal = String(sourceVal).toLowerCase().trim();
        let sCompVal = String(compVal).toLowerCase().trim();

        // Handle smart tokens in preview simulation
        if (sCompVal === '@me') {
          const mockUser = 'megan.bowen@contoso.com';
          isMatch = cond.condition === '==' 
            ? (sSourceVal === mockUser || sSourceVal === 'megan bowen' || sSourceVal.length > 0)
            : (sSourceVal === '');
        } else if (sCompVal === '@now') {
          const today = new Date().toISOString().split('T')[0];
          isMatch = cond.condition === '==' ? (sSourceVal === today) : (sSourceVal !== today);
        } else {
          if (sCompVal === "''" || sCompVal === '""') {
            sCompVal = '';
          }

          switch (cond.condition) {
            case '==': isMatch = sSourceVal === sCompVal; break;
            case '!=': isMatch = sSourceVal !== sCompVal; break;
            case '>': isMatch = !isNaN(parseFloat(sourceVal)) && !isNaN(parseFloat(compVal)) && parseFloat(sourceVal) > parseFloat(compVal); break;
            case '<': isMatch = !isNaN(parseFloat(sourceVal)) && !isNaN(parseFloat(compVal)) && parseFloat(sourceVal) < parseFloat(compVal); break;
            case '>=': isMatch = !isNaN(parseFloat(sourceVal)) && !isNaN(parseFloat(compVal)) && parseFloat(sourceVal) >= parseFloat(compVal); break;
            case '<=': isMatch = !isNaN(parseFloat(sourceVal)) && !isNaN(parseFloat(compVal)) && parseFloat(sourceVal) <= parseFloat(compVal); break;
            default: isMatch = false;
          }
        }
      }

      return {
        field: cond.field,
        condition: cond.condition,
        expected: cond.value,
        currentValue: String(sourceVal ?? ''),
        isMatch
      };
    });

    const isVisible = visLogicalOperator === 'AND'
      ? breakdown.every(r => r.isMatch)
      : breakdown.some(r => r.isMatch);

    return {
      hasRules: true,
      isVisible,
      breakdown,
      operator: visLogicalOperator,
      targetField: visTargetField
    };
  };

  const visDiag = getVisibilityDiagnostics();
  const isTargetFieldVisible = () => visDiag.isVisible;

  // --- Icon mapping helper ---
  const renderPreviewIcon = (iconName) => {
    const n = (iconName || '').toLowerCase();
    if (n.includes('info')) return <Info size={20} />;
    if (n.includes('setting') || n.includes('gear')) return <Settings size={20} />;
    if (n.includes('alert') || n.includes('warning') || n.includes('error')) return <AlertCircle size={20} />;
    if (n.includes('check') || n.includes('tick')) return <Check size={20} />;
    if (n.includes('mail')) return <Mail size={20} />;
    if (n.includes('user') || n.includes('person')) return <User size={20} />;
    if (n.includes('file') || n.includes('doc')) return <FileText size={20} />;
    if (n.includes('calendar') || n.includes('date')) return <Calendar size={20} />;
    if (n.includes('link')) return <LinkIcon size={20} />;
    return <LayoutTemplate size={20} />;
  };

  const mapSPFontToTailwind = (spClass) => {
    const map = { 
      'ms-font-s': 'text-xs', 
      'ms-font-m': 'text-sm', 
      'ms-font-l': 'text-base', 
      'ms-font-xl': 'text-lg md:text-xl', 
      'ms-font-su': 'text-2xl md:text-3xl' 
    };
    return map[spClass] || 'text-sm';
  };

  // --- Render Mock Input Controls ---
  const renderMockInput = (fieldName) => {
    const fieldDetail = masterFields.find(mf => mf.name === fieldName) || { name: fieldName, label: fieldName, type: 'text' };
    const valRaw = mockValues[fieldName];
    const val = (valRaw && typeof valRaw === 'object') ? (valRaw.title ?? '') : (valRaw ?? '');

    switch (fieldDetail.type) {
      case 'choice':
        let choices = ['Option 1', 'Option 2', 'Option 3'];
        if (fieldName === 'Status') choices = ['New', 'In Progress', 'Completed', 'Approved', 'Rejected'];
        if (fieldName === 'Priority') choices = ['Low', 'Medium', 'High', 'Critical'];
        return (
          <select
            value={val}
            onChange={(e) => handleValChange(fieldName, e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
          >
            {choices.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        );
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!val}
              onChange={(e) => handleValChange(fieldName, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-xs peer-checked:bg-blue-600"></div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-2.5">
              {val ? 'Yes' : 'No'}
            </span>
          </label>
        );
      case 'date':
        return (
          <input
            type="date"
            value={val}
            onChange={(e) => handleValChange(fieldName, e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={val}
            onChange={(e) => handleValChange(fieldName, e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full text-xs px-3 py-2 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
        );
      case 'user':
        return (
          <input
            type="text"
            value={val}
            onChange={(e) => {
              const current = mockValues[fieldName];
              if (current && typeof current === 'object') {
                handleValChange(fieldName, { ...current, title: e.target.value });
              } else {
                handleValChange(fieldName, e.target.value);
              }
            }}
            placeholder="Display name"
            className="w-full text-xs px-3 py-2 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
        );
      case 'note':
        return (
          <textarea
            value={val}
            onChange={(e) => handleValChange(fieldName, e.target.value)}
            rows={2}
            className="w-full text-xs px-3 py-2 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs font-sans"
          />
        );
      default:
        return (
          <input
            type="text"
            value={val}
            onChange={(e) => handleValChange(fieldName, e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
        );
    }
  };

  const commandLabels = COMMAND_LABELS;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#0c1017] rounded-3xl border border-slate-300/80 dark:border-slate-700/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.25)] overflow-hidden min-h-[500px]">
      
      {/* 0. Live Simulation Toolbar: Viewport & Formula Inspector Toggle */}
      <div className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
            <Eye size={13} className="text-blue-500" />
            <span>Form Simulator</span>
          </span>

          {visDiag.hasRules && (
            <button
              type="button"
              onClick={() => setShowFormulaInspector(!showFormulaInspector)}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                visDiag.isVisible
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/80'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/80'
              }`}
              title="Click to view why fields are shown or hidden"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${visDiag.isVisible ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span>[{visDiag.targetField}] {visDiag.isVisible ? 'Visible' : 'Hidden'}</span>
              {showFormulaInspector ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          )}
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              viewport === 'desktop'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Desktop side-panel view"
          >
            <Monitor size={12} />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              viewport === 'mobile'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Mobile phone app view"
          >
            <Smartphone size={12} />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Formula Inspector Accordion */}
      {showFormulaInspector && visDiag.hasRules && (
        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 border-b border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              Formula Inspector: Live Evaluation for <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">[{visDiag.targetField}]</code>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              visDiag.isVisible 
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
            }`}>
              Currently {visDiag.isVisible ? 'SHOWN' : 'HIDDEN'}
            </span>
          </div>

          <div className="space-y-1.5">
            {visDiag.breakdown.map((rule, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-400">#{idx + 1}</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    [${rule.field}] {rule.condition} {rule.expected || "''"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                    Current Value: <strong className="text-slate-700 dark:text-slate-300 font-mono">"{rule.currentValue || '(blank)'}"</strong>
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    rule.isMatch 
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                  }`}>
                    {rule.isMatch ? 'PASSED ✓' : 'FAILED ✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-200/60 dark:border-slate-800/60">
            <span>
              Logic: <strong>{visDiag.operator === 'AND' ? 'AND (All rules must pass)' : 'OR (At least one rule must pass)'}</strong>
            </span>
            <span className="italic text-[10px]">Edit any field value below to see this update live!</span>
          </div>
        </div>
      )}
      
      {/* 1. Mock SharePoint Top Command Bar (Collapsible by default) */}
      {(() => {
        const allEntries = [
          ...Object.entries(commandLabels),
          ...customCommands.map((c) => [c.key, c.label])
        ];

        const visibleCommands = allEntries.filter(([key]) => {
          const cfg = commandConfigs[key] || {};
          if (cfg.hide === true || cfg.hide === 'true') return false;
          if (cfg.hide === false || cfg.hide === 'false') return true;
          return !hiddenCommands[key];
        });

        return (
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowCommandBarPreview(!showCommandBarPreview)}
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left select-none"
              title="Click to toggle command bar preview"
              aria-expanded={showCommandBarPreview}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${visibleCommands.length > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Mock Command Bar ({visibleCommands.length} Visible)
                </span>
                {showCommandBarPreview ? (
                  <ChevronUp size={12} className="text-slate-400" />
                ) : (
                  <ChevronDown size={12} className="text-slate-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {showCommandBarPreview ? 'Collapse ▴' : 'Expand buttons ▾'}
              </span>
            </button>

            {showCommandBarPreview && (
              <div className="px-4 py-2.5 flex flex-wrap gap-2 items-center bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-200/60 dark:border-slate-800/60">
                {visibleCommands.length === 0 ? (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">All commands hidden</span>
                ) : (
                  visibleCommands.map(([key, defaultLabel]) => {
                    const cfg = commandConfigs[key] || {};
                    const label = cfg.text || defaultLabel;
                    const isPrimary = !!cfg.primary;

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled
                        title={cfg.title || label}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-not-allowed select-none flex items-center gap-1.5 ${
                          isPrimary
                            ? 'bg-blue-600 text-white shadow-xs border border-blue-600 font-bold'
                            : 'text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs'
                        }`}
                      >
                        {cfg.iconName && (
                          <span className="font-mono text-[10px] opacity-80">{cfg.iconName}</span>
                        )}
                        <span>{label}</span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* 2. Mock SharePoint sliding panel body */}
      <div className={`flex-1 p-3 sm:p-5 overflow-y-auto custom-scrollbar flex items-start justify-center transition-all ${viewport === 'mobile' ? 'bg-slate-200/60 dark:bg-slate-950/80 py-6' : ''}`}>
        
        {/* Device Frame (Mobile Phone or Desktop Panel) */}
        <div className={`transition-all duration-300 flex flex-col overflow-hidden ${
          viewport === 'mobile'
            ? 'w-[320px] max-w-[320px] h-[580px] max-h-[580px] bg-white dark:bg-slate-900 rounded-[40px] border-[8px] border-slate-800 dark:border-slate-700 shadow-2xl relative select-none'
            : 'w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md min-h-[460px]'
        }`}>

          {/* Mobile Smartphone Status Bar & Notch */}
          {viewport === 'mobile' && (
            <div className="bg-slate-800 dark:bg-slate-700 pt-2 pb-1.5 px-5 flex items-center justify-between text-[10px] text-white/90 font-medium select-none shrink-0 z-10">
              <span>9:41</span>
              <div className="w-16 h-3 bg-slate-950 rounded-full mx-auto"></div>
              <span className="text-[9px] font-mono">5G 100%</span>
            </div>
          )}

          {/* Desktop SharePoint Drawer Bar */}
          {viewport === 'desktop' && (
            <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 select-none shrink-0">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                SharePoint Form Drawer (Desktop)
              </span>
              <div className="flex items-center gap-2">
                <button type="button" disabled className="px-2.5 py-1 bg-blue-600 text-white rounded-md text-[11px] font-semibold cursor-not-allowed opacity-90">
                  Save
                </button>
                <button type="button" disabled className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-semibold cursor-not-allowed">
                  Cancel
                </button>
                <span className="text-slate-400 text-xs px-1 select-none font-bold">✕</span>
              </div>
            </div>
          )}

          {/* Scrollable Form Content (inside phone viewport for mobile, natural flow for desktop) */}
          <div className={`flex-1 flex flex-col ${viewport === 'mobile' ? 'overflow-y-auto custom-scrollbar' : ''}`}>
            
            {/* Form Header */}
            <div className="flex flex-col w-full shrink-0">
              {headerContainers.map(hc => {
                if (!isVisible(hc.containerVis)) return null;
                
                const titleVisible = isVisible(hc.titleVis);
                const iconVisible = hc.showIcon && isVisible(hc.iconVis);

                return (
                  <div 
                    key={`preview-${hc.id}`} 
                    className={`${viewport === 'mobile' ? 'px-4 py-3' : 'px-6 py-4'} flex items-center shadow-xs border-b border-black/5`} 
                    style={{ 
                      backgroundColor: hc.bgColor, 
                      color: hc.textColor, 
                      justifyContent: hc.align 
                    }}
                  >
                    {iconVisible && (
                      <div className="mr-3 flex items-center justify-center scale-95 opacity-90">
                        {renderPreviewIcon(hc.icon)}
                      </div>
                    )}
                    {titleVisible && (
                      <div className={`${viewport === 'mobile' ? 'text-sm' : mapSPFontToTailwind(hc.textSize)} font-bold break-words tracking-tight`}>
                        {evaluateExpression(hc.title, mockValues)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Body - Grid / Columns */}
            <div className={`flex-1 ${viewport === 'mobile' ? 'p-3.5 space-y-4' : 'p-5 md:p-6 space-y-6'}`}>
              {bodySections.map((sec) => (
                <div key={`preview-sec-${sec.id}`} className="space-y-3">
                  <h3 className={`font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/50 pb-1 ${viewport === 'mobile' ? 'text-[10px]' : 'text-xs'}`}>
                    {sec.title || 'Untitled Section'}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {sec.fields.map((fieldName) => {
                      const isTarget = fieldName === visTargetField;
                      const visible = !isTarget || isTargetFieldVisible();
                      const fieldDetail = masterFields.find(mf => mf.name === fieldName) || { name: fieldName, label: fieldName, type: 'text' };

                      if (!visible) return null;

                      return (
                        <div 
                          key={`preview-field-${fieldName}`} 
                          className={`py-1.5 border-b border-slate-100 dark:border-slate-800/30 ${
                            viewport === 'mobile'
                              ? 'flex flex-col items-start gap-1'
                              : 'flex flex-col sm:flex-row sm:items-center justify-between gap-2'
                          } ${isTarget ? 'bg-yellow-50/20 dark:bg-yellow-950/5 p-2 rounded border border-dashed border-yellow-300/30' : ''}`}
                        >
                          <div className={`${viewport === 'mobile' ? 'w-full' : 'w-full sm:w-1/3'} flex items-center gap-1.5 select-none`}>
                            <span className={`${viewport === 'mobile' ? 'text-[11px]' : 'text-xs'} font-semibold text-slate-600 dark:text-slate-400`}>
                              {fieldDetail.label}
                            </span>
                            {isTarget && (
                              <span className="text-[9px] bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 px-1 rounded font-bold uppercase">
                                Conditional
                              </span>
                            )}
                          </div>
                          <div className={`${viewport === 'mobile' ? 'w-full' : 'w-full sm:w-2/3 max-w-sm'}`}>
                            {renderMockInput(fieldName)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {bodySections.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400 dark:text-slate-500">No body sections configured.</p>
                </div>
              )}
            </div>

            {/* Form Footer */}
            <div className="flex flex-col w-full mt-auto shrink-0">
              {footerContainers.map((fc, index) => {
                if (!isVisible(fc.containerVis)) return null;

                const textVisible = isVisible(fc.textVis);
                const linksVisible = fc.links?.length > 0 && isVisible(fc.linksVis);

                return (
                  <div 
                    key={`preview-ft-${fc.id}`} 
                    className={`w-full ${viewport === 'mobile' ? 'px-4 py-3 text-xs' : 'px-6 py-4'} break-words shadow-inner border-t border-slate-100 dark:border-slate-800 ${mapSPFontToTailwind(fc.textSize)}`} 
                    style={{ 
                      backgroundColor: fc.bgColor, 
                      color: fc.textColor, 
                      textAlign: fc.align 
                    }}
                  >
                    {textVisible && (
                      <span className="font-medium">
                        {evaluateExpression(fc.text, mockValues)}
                      </span>
                    )}
                    {linksVisible && (
                      <span className="inline-flex flex-wrap items-center">
                        {fc.links.map((link, idx) => (
                          <React.Fragment key={link.id}>
                            {(textVisible || idx > 0) && (
                              <span className="mx-2 opacity-40">|</span>
                            )}
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="no-underline font-semibold hover:underline inline-flex items-center gap-0.5" 
                              style={{ 
                                color: fc.textColor !== '#605e5c' ? fc.textColor : '#0078d4' 
                              }}
                            >
                              {link.text} <ExternalLink size={10} className="opacity-70" />
                            </a>
                          </React.Fragment>
                        ))}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Smartphone Home Indicator Bar (Mobile Only) */}
          {viewport === 'mobile' && (
            <div className="py-2 flex justify-center bg-white dark:bg-slate-900 select-none shrink-0 z-10 border-t border-slate-100 dark:border-slate-800/40">
              <div className="w-24 h-1 bg-slate-400/60 dark:bg-slate-600 rounded-full"></div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
