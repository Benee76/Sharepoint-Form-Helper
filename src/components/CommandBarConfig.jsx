import React, { useState } from 'react';
import { EyeOff, Search, FolderPlus, Edit3, Share2, Zap, Download, Shield, Eye, SlidersHorizontal, Plus, Trash2, RotateCcw, ChevronDown, ChevronUp, Sparkles, Wrench, Lock, CheckCircle2 } from 'lucide-react';
import { COMMAND_CATEGORIES, COMMON_FLUENT_ICONS } from '../lib/formUtils';

export const CommandBarConfig = ({
  hiddenCommands = {},
  handleCommandToggle,
  toggleCommandVisibility,
  handleSelectAllCommands = () => {},
  handleCategoryCommandsToggle = () => {},
  applyCommandBarPreset = () => {},
  commandConfigs = {},
  updateCommandConfig = () => {},
  resetCommandConfig = () => {},
  customCommands = [],
  addCustomCommand = () => {},
  removeCustomCommand = () => {}
}) => {
  const onToggleCommand = handleCommandToggle || toggleCommandVisibility || (() => {});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCommand, setExpandedCommand] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [customError, setCustomError] = useState('');

  const totalCommands = Object.keys(hiddenCommands).length;
  const totalHidden = Object.values(hiddenCommands).filter(Boolean).length;
  const totalCustomized = Object.keys(commandConfigs).length;
  const isAllSelected = totalCommands > 0 && totalHidden === totalCommands;

  // Determine which of the 3 presets is currently active
  const isPresetFull = totalHidden === 0;
  const isPresetAddOnly = !!hiddenCommands.delete && !hiddenCommands.new;
  const isPresetNoTools = !isPresetAddOnly && !!hiddenCommands.automate && !hiddenCommands.delete;

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'FolderPlus': return <FolderPlus size={16} className="text-blue-500" />;
      case 'Edit3': return <Edit3 size={16} className="text-amber-500" />;
      case 'Share2': return <Share2 size={16} className="text-emerald-500" />;
      case 'Zap': return <Zap size={16} className="text-purple-500" />;
      case 'Download': return <Download size={16} className="text-cyan-500" />;
      case 'Shield': return <Shield size={16} className="text-rose-500" />;
      default: return <Zap size={16} className="text-blue-500" />;
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    setCustomError('');
    if (!newCustomKey.trim()) {
      setCustomError('Command key is required.');
      return;
    }
    const res = addCustomCommand(newCustomKey, newCustomLabel);
    if (res && !res.success) {
      setCustomError(res.error);
    } else {
      setNewCustomKey('');
      setNewCustomLabel('');
      setShowAddCustom(false);
    }
  };

  const handleToggleSelectionMode = (key, mode) => {
    const currentModes = commandConfigs[key]?.selectionModes || [];
    let nextModes;
    if (currentModes.includes(mode)) {
      nextModes = currentModes.filter((m) => m !== mode);
    } else {
      nextModes = [...currentModes, mode];
    }
    updateCommandConfig(key, 'selectionModes', nextModes);
  };

  // Build combined categories including custom commands if any exist
  const allCategories = [...COMMAND_CATEGORIES];
  if (customCommands.length > 0) {
    allCategories.push({
      id: 'custom',
      label: 'Custom & SPFx Commands',
      icon: 'Zap',
      description: 'Custom action commands and SharePoint Framework extensions',
      commands: Object.fromEntries(customCommands.map((c) => [c.key, c.label]))
    });
  }

  const filteredCategories = allCategories.map((cat) => {
    const matchingEntries = Object.entries(cat.commands).filter(([key, label]) => {
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return label.toLowerCase().includes(q) || key.toLowerCase().includes(q);
    });

    return {
      ...cat,
      matchingCommands: Object.fromEntries(matchingEntries)
    };
  }).filter((cat) => Object.keys(cat.matchingCommands).length > 0);

  return (
    <div className="space-y-6">
      {/* 3 Main Primary Options Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Quick Setup Options
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select one of the 3 most common command bar configurations with a single click:
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {totalHidden} commands hidden
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Option 1: Full Command Bar */}
          <button
            type="button"
            onClick={() => applyCommandBarPreset && applyCommandBarPreset('full')}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
              isPresetFull
                ? 'border-blue-500 bg-gradient-to-b from-blue-50/80 to-blue-50/20 dark:from-blue-950/50 dark:to-transparent ring-2 ring-blue-500/20 shadow-xs'
                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="p-2 rounded-xl bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 shadow-2xs">
                  <Sparkles size={17} />
                </div>
                {isPresetFull && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={11} /> ACTIVE
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                1. Full Command Bar
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Show all standard options. Leaves the default SharePoint toolbar completely intact.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">All tools visible</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">Apply &rarr;</span>
            </div>
          </button>

          {/* Option 2: No Special Tools */}
          <button
            type="button"
            onClick={() => applyCommandBarPreset && applyCommandBarPreset('no-tools')}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
              isPresetNoTools
                ? 'border-purple-500 bg-gradient-to-b from-purple-50/80 to-purple-50/20 dark:from-purple-950/50 dark:to-transparent ring-2 ring-purple-500/20 shadow-xs'
                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="p-2 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 shadow-2xs">
                  <Wrench size={17} />
                </div>
                {isPresetNoTools && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={11} /> ACTIVE
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                2. No Special Tools
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Clean list view. Hides Automate, Integrate, Power Apps, Power BI, Rules, Alerts &amp; Copilot.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Core actions only</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">Apply &rarr;</span>
            </div>
          </button>

          {/* Option 3: Only Add New (No Deletion) */}
          <button
            type="button"
            onClick={() => applyCommandBarPreset && applyCommandBarPreset('add-only-no-delete')}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
              isPresetAddOnly
                ? 'border-emerald-500 bg-gradient-to-b from-emerald-50/80 to-emerald-50/20 dark:from-emerald-950/50 dark:to-transparent ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="p-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 shadow-2xs">
                  <Lock size={17} />
                </div>
                {isPresetAddOnly && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={11} /> ACTIVE
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                3. Only Add New
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Allows submitting new items, but disables item deletion, grid editing, and hides special tools.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">No delete / bulk edit</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">Apply &rarr;</span>
            </div>
          </button>
        </div>
      </div>

      {/* Expandable Fine-Tuning & Individual Commands */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 shadow-2xs">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={15} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Fine-Tune Individual Commands &amp; Details
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal hidden sm:inline">
              (Optional: search or tweak individual buttons)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              {showAdvanced ? 'Hide Details' : 'Show Details'}
            </span>
            {showAdvanced ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </div>
        </button>

        {showAdvanced && (
          <div className="p-4 space-y-4 border-t border-slate-200 dark:border-slate-800">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search commands by name or key (e.g. Delete, Export, Grid, Copilot)..."
                  className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none shadow-2xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustom(!showAddCustom)}
                  className="text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-xl font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Plus size={13} /> SPFx / Custom Key
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllCommands}
                  className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                >
                  {isAllSelected ? 'Show All' : 'Hide All'}
                </button>
              </div>
            </div>

      {/* Add Custom SPFx Command Drawer */}
      {showAddCustom && (
        <form onSubmit={handleAddCustom} className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Plus size={14} /> Add SPFx or Custom Command Key
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              e.g. SpfxCustomActionNavigationCommand_...
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Command Key (Unique ID)
              </label>
              <input
                type="text"
                value={newCustomKey}
                onChange={(e) => setNewCustomKey(e.target.value)}
                placeholder="SpfxCustomActionNavigationCommand_..."
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Label
              </label>
              <input
                type="text"
                value={newCustomLabel}
                onChange={(e) => setNewCustomLabel(e.target.value)}
                placeholder="My Custom Action"
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          {customError && <p className="text-xs text-red-500 font-semibold">{customError}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddCustom(false)}
              className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors shadow-xs"
            >
              Add Command
            </button>
          </div>
        </form>
      )}

      {/* Categorized List */}
      <div className="space-y-6">
        {filteredCategories.map((cat) => {
          const categoryKeys = Object.keys(cat.commands);
          const hiddenInCategory = categoryKeys.filter((k) => hiddenCommands[k]).length;
          const isCategoryAllHidden = hiddenInCategory === categoryKeys.length;

          return (
            <div 
              key={cat.id}
              className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3"
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 dark:border-slate-700/70 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{cat.label}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        hiddenInCategory > 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {hiddenInCategory} of {categoryKeys.length} hidden
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{cat.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleCategoryCommandsToggle && handleCategoryCommandsToggle(categoryKeys, !isCategoryAllHidden)}
                    className="text-[11px] px-2.5 py-1 rounded bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold transition-colors shadow-2xs"
                  >
                    {isCategoryAllHidden ? 'Show Category' : 'Hide Category'}
                  </button>
                </div>
              </div>

              {/* Commands Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {Object.entries(cat.matchingCommands).map(([key, defaultLabel]) => {
                  const isHidden = hiddenCommands[key];
                  const cfg = commandConfigs[key] || {};
                  const isCustomized = Object.keys(cfg).length > 0;
                  const isExpanded = expandedCommand === key;
                  const isCustomItem = cat.id === 'custom';

                  return (
                    <div
                      key={key}
                      className={`rounded-lg border transition-all ${
                        isHidden
                          ? 'border-red-300 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10'
                          : isCustomized
                            ? 'border-blue-300 dark:border-blue-900/60 bg-blue-50/10 dark:bg-blue-950/10'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {/* Command Main Row */}
                      <div className="p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isHidden ? 'bg-red-500' : isCustomized ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                                {cfg.text || defaultLabel}
                              </span>
                              {isCustomized && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold">
                                  CUSTOMIZED
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block truncate">{key}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Customize Accordion Button */}
                          <button
                            type="button"
                            onClick={() => setExpandedCommand(isExpanded ? null : key)}
                            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 border ${
                              isExpanded
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                            title="Customize text, icon, position, or placement"
                            aria-label={`Customize ${defaultLabel}`}
                          >
                            <SlidersHorizontal size={13} />
                            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          </button>

                          {/* Quick Toggle Visible/Hidden */}
                          <button
                            type="button"
                            onClick={() => onToggleCommand(key)}
                            aria-label={`Toggle visibility of ${defaultLabel}`}
                            className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${
                              isHidden
                                ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'
                                : 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                            }`}
                          >
                            {isHidden ? 'HIDDEN' : 'VISIBLE'}
                          </button>

                          {/* If custom command, delete button */}
                          {isCustomItem && (
                            <button
                              type="button"
                              onClick={() => removeCustomCommand(key)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Delete custom command"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Advanced Customization Drawer */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50/70 dark:bg-slate-950/50 rounded-b-lg space-y-3 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Custom Text */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Custom Display Text (<span className="font-mono">text</span>)
                              </label>
                              <input
                                type="text"
                                value={cfg.text || ''}
                                onChange={(e) => updateCommandConfig(key, 'text', e.target.value)}
                                placeholder={defaultLabel}
                                className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200"
                              />
                            </div>

                            {/* Tooltip */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Hover Tooltip (<span className="font-mono">title</span>)
                              </label>
                              <input
                                type="text"
                                value={cfg.title || ''}
                                onChange={(e) => updateCommandConfig(key, 'title', e.target.value)}
                                placeholder="Tooltip text..."
                                className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200"
                              />
                            </div>

                            {/* Fluent UI Icon */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Fluent UI Icon (<span className="font-mono">iconName</span>)
                              </label>
                              <input
                                type="text"
                                value={cfg.iconName || ''}
                                onChange={(e) => updateCommandConfig(key, 'iconName', e.target.value)}
                                placeholder="e.g. EditTable, Share, Download..."
                                className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono text-slate-800 dark:text-slate-200"
                              />
                              <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto">
                                {COMMON_FLUENT_ICONS.slice(0, 8).map((ic) => (
                                  <button
                                    key={ic}
                                    type="button"
                                    onClick={() => updateCommandConfig(key, 'iconName', ic)}
                                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 font-mono text-slate-700 dark:text-slate-300 transition-colors"
                                  >
                                    {ic}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Placement Section & Position */}
                            <div className="space-y-2">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                  Section Placement (<span className="font-mono">sectionType</span>)
                                </label>
                                <select
                                  value={cfg.sectionType || ''}
                                  onChange={(e) => updateCommandConfig(key, 'sectionType', e.target.value)}
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200"
                                >
                                  <option value="">Default Placement</option>
                                  <option value="Primary">Primary (Main Bar)</option>
                                  <option value="Overflow">Overflow (More ... Menu)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                  Position Index (0-based)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={cfg.position !== undefined ? cfg.position : ''}
                                  onChange={(e) => updateCommandConfig(key, 'position', e.target.value)}
                                  placeholder="Default order"
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Primary styling & Selection Modes */}
                          <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex flex-col sm:flex-row justify-between gap-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!cfg.primary}
                                onChange={(e) => updateCommandConfig(key, 'primary', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                Primary button accent (<span className="font-mono">primary: true</span>)
                              </span>
                            </label>

                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-500">Selection Modes:</span>
                              {['NoSelection', 'SingleSelection', 'MultiSelection'].map((mode) => {
                                const active = (cfg.selectionModes || []).includes(mode);
                                return (
                                  <button
                                    key={mode}
                                    type="button"
                                    onClick={() => handleToggleSelectionMode(key, mode)}
                                    className={`text-[9px] px-2 py-0.5 rounded font-semibold border transition-all ${
                                      active
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                    }`}
                                  >
                                    {mode}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Reset command config */}
                          {isCustomized && (
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => resetCommandConfig(key)}
                                className="text-[10px] text-slate-500 hover:text-red-500 flex items-center gap-1 font-semibold transition-colors"
                              >
                                <RotateCcw size={11} /> Reset this command to default
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No command actions match "{searchTerm}". Try another keyword or clear the search.
            </p>
          </div>
        )}
      </div>
    </div>
  )}
</div>
    </div>
  );
};


