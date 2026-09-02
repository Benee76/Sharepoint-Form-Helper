import React, { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Import, AlertTriangle, CheckCircle2, Download, Package, LayoutTemplate, LayoutList, PanelBottom, ToggleLeft, EyeOff } from 'lucide-react';
import { copyToClipboard } from '../lib/formUtils';

const FORMAT_OPTIONS = [
  { id: 'bundle', label: 'Full Bundle', title: 'Full Workspace Bundle (JSON)', icon: Package, target: 'Complete Form Workspace Backup / Sharing' },
  { id: 'header', label: 'Header', title: 'Header Layout (JSON)', icon: LayoutTemplate, target: 'SharePoint Form → Configure layout → Header' },
  { id: 'body', label: 'Body', title: 'Body Sections (JSON)', icon: LayoutList, target: 'SharePoint Form → Configure layout → Body' },
  { id: 'footer', label: 'Footer', title: 'Footer Layout (JSON)', icon: PanelBottom, target: 'SharePoint Form → Configure layout → Footer' },
  { id: 'commandbar', label: 'Command Bar', title: 'Command Bar Props (JSON)', icon: ToggleLeft, target: 'SharePoint View → Format current view → commandBarProps' },
  { id: 'visibility', label: 'Visibility Formula', title: 'Conditional Visibility Formula', icon: EyeOff, target: 'SharePoint Form → Edit columns → Edit formula' }
];

const TARGET_INSTRUCTIONS = {
  bundle: 'Contains Header, Body, Footer, Command Bar, Field Pool & Visibility formulas. Use this to backup or share your entire template.',
  header: 'Paste this JSON into your SharePoint list form: click "Configure layout" (top-right) → select "Header" from dropdown → paste here.',
  body: 'Paste this JSON into your SharePoint list form: click "Configure layout" (top-right) → select "Body" from dropdown → paste here.',
  footer: 'Paste this JSON into your SharePoint list form: click "Configure layout" (top-right) → select "Footer" from dropdown → paste here.',
  commandbar: 'Paste this JSON into your SharePoint list view: click view dropdown → "Format current view" → "Advanced mode" → paste here.',
  visibility: 'Paste this formula into your SharePoint list form: click "Edit columns" → select the target field → "Edit formula" → paste here.'
};

export const JsonOutput = ({
  activeTab = 'header',
  generateHeaderJSON,
  generateBodyJSON,
  generateFooterJSON,
  generateFieldVisibilityFormula,
  generateCommandBarJSON,
  generateFullBundleJSON,
  importJSON
}) => {
  const [selectedFormat, setSelectedFormat] = useState(() => {
    return activeTab === 'presets' ? 'bundle' : activeTab;
  });
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importType, setImportType] = useState('bundle');
  const [importError, setImportError] = useState('');
  const [importDiagnostics, setImportDiagnostics] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Sync selected format when switching config tab on the left
  useEffect(() => {
    if (activeTab === 'presets') {
      setSelectedFormat('bundle');
      setImportType('bundle');
    } else if (['header', 'body', 'footer', 'commandbar', 'visibility', 'bundle'].includes(activeTab)) {
      setSelectedFormat(activeTab);
      if (activeTab !== 'visibility') {
        setImportType(activeTab);
      }
    }
  }, [activeTab]);

  const getCurrentContent = () => {
    switch (selectedFormat) {
      case 'header': return JSON.stringify(generateHeaderJSON ? generateHeaderJSON() : {}, null, 2);
      case 'body': return JSON.stringify(generateBodyJSON ? generateBodyJSON() : {}, null, 2);
      case 'footer': return JSON.stringify(generateFooterJSON ? generateFooterJSON() : {}, null, 2);
      case 'commandbar': return JSON.stringify(generateCommandBarJSON ? generateCommandBarJSON() : {}, null, 2);
      case 'visibility': return generateFieldVisibilityFormula ? generateFieldVisibilityFormula() : '';
      case 'bundle': return JSON.stringify(generateFullBundleJSON ? generateFullBundleJSON() : {}, null, 2);
      default: return '';
    }
  };

  const handleCopy = async () => {
    const text = getCurrentContent();
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const text = getCurrentContent();
    if (!text) return;
    const isFormula = selectedFormat === 'visibility';
    const blob = new Blob([text], { type: isFormula ? 'text/plain' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFormat === 'bundle'
      ? 'sharepoint-form-full-bundle.json'
      : isFormula
        ? 'sharepoint-visibility-formula.txt'
        : `sharepoint-${selectedFormat}-formatting.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError('');
    setImportDiagnostics(null);
    setImportSuccess(false);

    if (!importText.trim()) {
      setImportError('Please paste some JSON first.');
      return;
    }

    const res = importJSON(importText, importType);
    if (res.success) {
      setImportSuccess(true);
      setImportDiagnostics(null);
      setImportText('');
      setTimeout(() => setImportSuccess(false), 3000);
    } else {
      setImportError(res.error || 'Failed to parse JSON. Please check syntax.');
      setImportDiagnostics(res);
    }
  };

  const activeFormatMeta = FORMAT_OPTIONS.find((f) => f.id === selectedFormat) || FORMAT_OPTIONS[0];

  return (
    <div className="space-y-5">
      {/* 1. Format Switcher Segmented Pills */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
          Output Format:
        </label>
        <div 
          className="flex flex-wrap bg-slate-200/60 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-300/40 dark:border-slate-800 gap-1 shadow-2xs" 
          role="tablist" 
          aria-label="Output format selection"
        >
          {FORMAT_OPTIONS.map((fmt) => {
            const IconComponent = fmt.icon;
            const isSelected = selectedFormat === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/60'
                }`}
              >
                <IconComponent size={13} className={isSelected ? 'text-white' : 'opacity-70'} />
                <span>{fmt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Code Viewer Terminal */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[380px]">
        {/* Clean Header Bar */}
        <div className="bg-[#1e293b] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 text-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 flex-shrink-0">
              <Terminal size={14} />
            </div>
            <span className="text-xs font-mono font-medium text-slate-200 select-none truncate block">
              {activeFormatMeta.title}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 text-xs font-medium shadow-xs"
              title="Download as file"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 text-xs font-semibold shadow-xs shadow-blue-500/20"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-300" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-900/40 text-[11px] text-blue-300 flex items-center gap-1.5">
          <span className="font-semibold text-blue-400 uppercase text-[10px] tracking-wider flex-shrink-0">SharePoint Placement:</span>
          <span className="text-slate-300 truncate">{TARGET_INSTRUCTIONS[selectedFormat]}</span>
        </div>

        {/* Code Content */}
        <div className="p-5 flex-1 overflow-auto custom-scrollbar font-mono text-xs sm:text-[13px] leading-relaxed max-h-[440px]">
          <pre className="text-emerald-400 dark:text-emerald-300 whitespace-pre-wrap break-all">
            {getCurrentContent() || <span className="text-slate-500 italic">No output generated</span>}
          </pre>
        </div>
      </div>

      <hr className="border-slate-200/80 dark:border-slate-800" />

      {/* 3. Import Existing SharePoint Formatting */}
      <div className="bg-slate-50/80 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Import size={15} className="text-blue-500" />
            Import Existing SharePoint Formatting or Full Bundle
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Paste your existing SharePoint JSON formatting or Full Bundle below to import and edit it visually.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-1">
              Payload Type:
            </span>
            <div className="flex flex-wrap bg-slate-200/60 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-300/40 dark:border-slate-800 gap-1 shadow-2xs">
              {[
                { id: 'bundle', label: 'Full Bundle' },
                { id: 'header', label: 'Header' },
                { id: 'body', label: 'Body' },
                { id: 'footer', label: 'Footer' },
                { id: 'commandbar', label: 'Command Bar' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setImportType(t.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                    importType === t.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={4}
            placeholder={
              importType === 'bundle'
                ? 'Paste full bundle JSON here to restore entire form workspace...'
                : `Paste your SharePoint ${importType.toUpperCase()} formatting JSON here...`
            }
            className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
          />

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleImport}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-95"
            >
              <Import size={14} /> Parse &amp; Load Payload
            </button>

            {importSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 size={15} /> Successfully imported config!
              </div>
            )}
          </div>

          {importError && (
            <div className="p-3.5 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
                <AlertTriangle size={15} className="flex-shrink-0" />
                <span>
                  JSON Syntax Error {importDiagnostics?.line ? `(Line ${importDiagnostics.line}${importDiagnostics.column ? `, Col ${importDiagnostics.column}` : ''})` : ''}
                </span>
              </div>
              <p className="text-rose-600 dark:text-rose-400 font-mono text-[11px] break-all">
                {importError}
              </p>
              {importDiagnostics?.snippet && (
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/60 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                  <span className="text-rose-500 mr-2 font-bold">&gt; Line {importDiagnostics.line}:</span>
                  <code>{importDiagnostics.snippet}</code>
                </div>
              )}
              {importDiagnostics?.hint && (
                <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                  💡 <strong>Tip:</strong> {importDiagnostics.hint}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
