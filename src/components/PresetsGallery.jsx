import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Palette, Sparkles, Info, Check, Plus, ChevronDown, ChevronUp, Share2, HelpCircle } from 'lucide-react';

const STORAGE_PALETTES_KEY = 'sp_form_custom_palettes';

const DEFAULT_BRAND_PALETTES = [
  { name: 'SharePoint Blue', primary: '#0078d4', text: '#ffffff', footerBg: '#f3f2f1', footerText: '#0078d4' },
  { name: 'Teal Green', primary: '#005a9e', text: '#ffffff', footerBg: '#f0fdf4', footerText: '#005a9e' },
  { name: 'Orange Accent', primary: '#d83b01', text: '#ffffff', footerBg: '#fff7ed', footerText: '#d83b01' },
  { name: 'Purple Accent', primary: '#5c2d91', text: '#ffffff', footerBg: '#faf5ff', footerText: '#5c2d91' },
  { name: 'Emerald Forest', primary: '#107c41', text: '#ffffff', footerBg: '#f0fdf4', footerText: '#107c41' },
  { name: 'Steel Gray', primary: '#323130', text: '#f3f2f1', footerBg: '#faf9f8', footerText: '#323130' },
  { name: 'Soft Dark', primary: '#201f1e', text: '#ffffff', footerBg: '#2d2c2c', footerText: '#ffffff' }
];

export const PresetsGallery = ({
  loadPreset,
  saveCustomPreset,
  loadCustomPreset,
  deleteCustomPreset,
  getCustomPresetsList,
  onApplyTheme
}) => {
  const [presetName, setPresetName] = useState('');
  const [customPresets, setCustomPresets] = useState([]);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Custom Palette State
  const [customPrimary, setCustomPrimary] = useState('#0078d4');
  const [customHeaderText, setCustomHeaderText] = useState('#ffffff');
  const [customFooterBg, setCustomFooterBg] = useState('#f3f2f1');
  const [customFooterText, setCustomFooterText] = useState('#0078d4');
  const [paletteName, setPaletteName] = useState('');
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [appliedFeedback, setAppliedFeedback] = useState(false);

  useEffect(() => {
    refreshPresets();
    try {
      const stored = localStorage.getItem(STORAGE_PALETTES_KEY);
      if (stored) {
        setSavedPalettes(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const refreshPresets = () => {
    setCustomPresets(getCustomPresetsList());
  };

  const handleSave = () => {
    if (!presetName.trim()) return;
    const existing = customPresets.includes(presetName.trim());
    if (existing && !window.confirm(`Overwrite saved template "${presetName.trim()}"?`)) return;
    saveCustomPreset(presetName.trim());
    setPresetName('');
    refreshPresets();
  };

  const handleDelete = (name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete saved template "${name}"?`)) return;
    deleteCustomPreset(name);
    refreshPresets();
  };

  const handleApplyPalette = (primary, text, footerBg, footerText) => {
    onApplyTheme(primary, text, footerBg, footerText);
    setAppliedFeedback(true);
    setTimeout(() => setAppliedFeedback(false), 2000);
  };

  const handleSavePalette = () => {
    if (!paletteName.trim()) return;
    const newPal = {
      name: paletteName.trim(),
      primary: customPrimary,
      text: customHeaderText,
      footerBg: customFooterBg,
      footerText: customFooterText
    };
    const updated = [...savedPalettes.filter((p) => p.name !== newPal.name), newPal];
    setSavedPalettes(updated);
    setPaletteName('');
    try {
      localStorage.setItem(STORAGE_PALETTES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const handleDeletePalette = (name, e) => {
    e.stopPropagation();
    const updated = savedPalettes.filter((p) => p.name !== name);
    setSavedPalettes(updated);
    try {
      localStorage.setItem(STORAGE_PALETTES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Custom Form Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FolderOpen size={16} className="text-indigo-500" />
            Your Custom Form Templates
          </h3>
          <button
            type="button"
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            title={showHowItWorks ? "Click to close guide" : "Click to open guide & instructions"}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/60"
          >
            <HelpCircle size={14} />
            <span>{showHowItWorks ? 'Hide Guide' : 'How do templates work?'}</span>
          </button>
        </div>

        {/* How Presets Work Guide Box */}
        {showHowItWorks && (
          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-indigo-900 dark:text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Info size={14} className="text-indigo-600 dark:text-indigo-400" /> How Custom Templates &amp; Presets Work
              </span>
              <button
                type="button"
                onClick={() => setShowHowItWorks(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
              <li>
                <strong>What gets saved:</strong> The entire workspace snapshot — including Header blocks, Body sections &amp; field order, Footer text &amp; links, Command Bar settings, Master fields, and Conditional Visibility formulas.
              </li>
              <li>
                <strong>Where it is saved:</strong> Templates are saved directly in your browser's persistent <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">localStorage</code>, so they remain available on your device across sessions without requiring logins or cloud permissions.
              </li>
              <li>
                <strong>How to load:</strong> Simply click any template from your saved list below to restore that complete form layout instantly.
              </li>
              <li>
                <strong>Exporting or sharing:</strong> To transfer a template to another computer or share it with a teammate, go to the <strong>Code &amp; Import</strong> tab and choose <strong>Full Bundle</strong> to copy the JSON file.
              </li>
            </ul>
          </div>
        )}

        {/* Save Template Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Template name (e.g. Finance Approval, HR Onboarding)"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!presetName.trim()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <Save size={14} /> Save Template
          </button>
        </div>

        {/* Saved Templates List */}
        {customPresets.length > 0 ? (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {customPresets.map((name) => (
              <div
                key={name}
                onClick={() => loadCustomPreset(name)}
                className="flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Load &rarr;</span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(name, e)}
                    aria-label={`Delete preset ${name}`}
                    className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-5 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No custom templates saved yet. Configure your form and save it above!
            </p>
          </div>
        )}
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* 2. Color Palette Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Palette size={16} className="text-blue-500" />
            Color Palette Editor
          </h3>
          {appliedFeedback && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check size={13} /> Applied to Form!
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pick or customize the primary brand colors applied to your form's headers, banners, and footers.
        </p>

        {/* Curated SharePoint Palettes */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            SharePoint Brand Themes:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DEFAULT_BRAND_PALETTES.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setCustomPrimary(p.primary);
                  setCustomHeaderText(p.text);
                  setCustomFooterBg(p.footerBg);
                  setCustomFooterText(p.footerText);
                  handleApplyPalette(p.primary, p.text, p.footerBg, p.footerText);
                }}
                className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg transition-all hover:shadow-xs text-left"
              >
                <div className="flex -space-x-1 flex-shrink-0">
                  <span className="h-4 w-4 rounded-full border border-white dark:border-slate-900 block" style={{ backgroundColor: p.primary }}></span>
                  <span className="h-4 w-4 rounded-full border border-white dark:border-slate-900 block" style={{ backgroundColor: p.footerBg }}></span>
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Palette Editor Card */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Edit Custom Color Palette
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Header Background */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Header Background (Primary)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Header Text */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Header Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customHeaderText}
                  onChange={(e) => setCustomHeaderText(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  value={customHeaderText}
                  onChange={(e) => setCustomHeaderText(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Footer Background */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Footer Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customFooterBg}
                  onChange={(e) => setCustomFooterBg(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  value={customFooterBg}
                  onChange={(e) => setCustomFooterBg(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Footer Accent/Text */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Footer Text / Links Accent
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customFooterText}
                  onChange={(e) => setCustomFooterText(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  value={customFooterText}
                  onChange={(e) => setCustomFooterText(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Swatch Live Mini-Preview */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
              Live Swatch Preview:
            </label>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xs">
              <div
                className="p-2 text-xs font-bold transition-colors"
                style={{ backgroundColor: customPrimary, color: customHeaderText }}
              >
                Sample Header Banner
              </div>
              <div
                className="p-2 text-xs font-medium border-t border-slate-200 dark:border-slate-700 transition-colors"
                style={{ backgroundColor: customFooterBg, color: customFooterText }}
              >
                Sample Footer &bull; Help &bull; Contact Support
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Palette name (e.g. Brand Blue)"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={handleSavePalette}
                disabled={!paletteName.trim()}
                className="px-2.5 py-1 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold disabled:opacity-50 transition-colors"
              >
                Save Swatch
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleApplyPalette(customPrimary, customHeaderText, customFooterBg, customFooterText)}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
            >
              Apply Palette to Form
            </button>
          </div>

          {/* Saved Custom Palettes List */}
          {savedPalettes.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Your Saved Custom Swatches:
              </label>
              <div className="flex flex-wrap gap-2">
                {savedPalettes.map((sp) => (
                  <div
                    key={sp.name}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs shadow-2xs"
                  >
                    <span
                      onClick={() => {
                        setCustomPrimary(sp.primary);
                        setCustomHeaderText(sp.text);
                        setCustomFooterBg(sp.footerBg);
                        setCustomFooterText(sp.footerText);
                        handleApplyPalette(sp.primary, sp.text, sp.footerBg, sp.footerText);
                      }}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600"
                    >
                      <span className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: sp.primary }}></span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{sp.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeletePalette(sp.name, e)}
                      className="text-slate-400 hover:text-red-500 p-0.5 ml-1"
                      title="Delete swatch"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* 3. Pre-built SharePoint Templates */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500" />
          Pre-built SharePoint Templates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => loadPreset('helpdesk')}
            className="flex flex-col items-start p-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-left transition-all hover:shadow-sm"
          >
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Help Desk Ticket</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Header with dynamic priority text, organized body sections &amp; escalation link in footer.</span>
          </button>
          <button 
            type="button"
            onClick={() => loadPreset('tracker')}
            className="flex flex-col items-start p-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-left transition-all hover:shadow-sm"
          >
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Project Tracker</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Status header banner, timeline fields, audit logs &amp; Teams link.</span>
          </button>
        </div>
      </div>
    </div>
  );
};

