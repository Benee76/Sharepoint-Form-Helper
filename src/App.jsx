import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { useFormState } from './hooks/useFormState';
import { PresetsGallery } from './components/PresetsGallery';
import { HeaderConfig } from './components/HeaderConfig';
import { BodyConfig } from './components/BodyConfig';
import { FooterConfig } from './components/FooterConfig';
import { VisibilityConfig } from './components/VisibilityConfig';
import { CommandBarConfig } from './components/CommandBarConfig';
import { FormPreview } from './components/FormPreview';
import { JsonOutput } from './components/JsonOutput';
import { 
  Sun, 
  Moon, 
  LayoutTemplate, 
  LayoutList, 
  PanelBottom, 
  EyeOff, 
  ToggleLeft, 
  FolderOpen, 
  Play, 
  Code, 
  RotateCcw,
  Undo2,
  Redo2,
  Share2,
  Check,
  Sparkles
} from 'lucide-react';
import { encodeStateToShareUrl, decodeStateFromShareHash, copyToClipboard } from './lib/formUtils';
import './App.css';

const CONFIG_TABS = [
  { id: 'header', label: 'Header', icon: LayoutTemplate },
  { id: 'body', label: 'Body Layout', icon: LayoutList },
  { id: 'footer', label: 'Footer', icon: PanelBottom },
  { id: 'visibility', label: 'Visibility', icon: EyeOff },
  { id: 'commandbar', label: 'Command Bar', icon: ToggleLeft },
  { id: 'presets', label: 'Templates & Themes', icon: FolderOpen }
];

const MainApp = () => {
  const { toggleTheme, isDark } = useTheme();
  const [activeConfigTab, setActiveConfigTab] = useState('header');
  const [activeRightTab, setActiveRightTab] = useState('preview');
  const [shareCopied, setShareCopied] = useState(false);
  const [sharedLoadedNotice, setSharedLoadedNotice] = useState(false);

  const state = useFormState();

  // Load shared configuration from URL hash if present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const decoded = decodeStateFromShareHash(window.location.hash);
      if (decoded) {
        const res = state.importJSON(JSON.stringify(decoded), 'bundle');
        if (res.success) {
          setSharedLoadedNotice(true);
        }
      }
    }
  }, []);

  // Keyboard shortcut listener for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (state.canUndo) state.undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        if (state.canRedo) state.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.canUndo, state.canRedo, state.undo, state.redo]);

  const handleShareLink = async () => {
    const bundle = state.generateFullBundleJSON();
    const url = encodeStateToShareUrl(bundle);
    if (url) {
      const ok = await copyToClipboard(url);
      if (ok) {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset the form to the default template? Unsaved visual edits will be lost (saved presets stay).')) {
      state.resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0c1017] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Shared Configuration Notice Banner */}
      {sharedLoadedNotice && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles size={15} />
            <span>Shared form layout loaded successfully from link!</span>
          </div>
          <button 
            onClick={() => setSharedLoadedNotice(false)} 
            className="text-white/80 hover:text-white font-bold ml-4 text-xs px-2 py-0.5 rounded hover:bg-white/10"
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* 1. Header Bar */}
      <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-500/20 flex items-center justify-center">
              <LayoutTemplate size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  SharePoint Form Helper
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Visual JSON formatting &amp; conditional formula designer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Undo Button */}
            <button
              type="button"
              onClick={state.undo}
              disabled={!state.canUndo}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800/80 transition-all text-xs font-semibold border border-slate-200/70 dark:border-slate-700/60 shadow-2xs active:scale-95"
              title="Undo layout change (Ctrl+Z)"
              aria-label="Undo"
            >
              <Undo2 size={14} />
              <span className="hidden md:inline">Undo</span>
            </button>

            {/* Redo Button */}
            <button
              type="button"
              onClick={state.redo}
              disabled={!state.canRedo}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800/80 transition-all text-xs font-semibold border border-slate-200/70 dark:border-slate-700/60 shadow-2xs active:scale-95"
              title="Redo layout change (Ctrl+Y)"
              aria-label="Redo"
            >
              <Redo2 size={14} />
              <span className="hidden md:inline">Redo</span>
            </button>

            {/* Share Link Button */}
            <button
              type="button"
              onClick={handleShareLink}
              aria-label="Share workspace link"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs font-semibold border shadow-2xs active:scale-95 ${
                shareCopied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/60'
              }`}
              title="Copy shareable link with current workspace to clipboard"
            >
              {shareCopied ? <Check size={14} /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{shareCopied ? 'Link Copied!' : 'Share'}</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all text-xs font-semibold border border-slate-200/70 dark:border-slate-700/60 shadow-2xs active:scale-95"
              title="Reset to default template"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200/70 dark:border-slate-700/60 shadow-2xs active:scale-95"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Studio Grid */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-5">
          {/* Segmented Tab Navigation */}
          <div 
            className="flex flex-wrap bg-slate-200/60 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-300/40 dark:border-slate-800 shadow-2xs gap-1 backdrop-blur-xs" 
            role="tablist" 
            aria-label="Configuration sections"
          >
            {CONFIG_TABS.map((tab) => {
              const isSelected = activeConfigTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveConfigTab(tab.id)}
                  className={`flex-1 min-w-[75px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all select-none ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700/60'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <TabIcon size={14} className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Configuration Card Container */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-300/80 dark:border-slate-700/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.25)] min-h-[480px]">
            {activeConfigTab === 'header' && (
              <HeaderConfig
                headerContainers={state.headerContainers}
                addHeaderContainer={state.addHeaderContainer}
                updateHeaderContainer={state.updateHeaderContainer}
                removeHeaderContainer={state.removeHeaderContainer}
              />
            )}
            {activeConfigTab === 'body' && (
              <BodyConfig
                masterFields={state.masterFields}
                customFieldName={state.customFieldName}
                setCustomFieldName={state.setCustomFieldName}
                customFieldLabel={state.customFieldLabel}
                setCustomFieldLabel={state.setCustomFieldLabel}
                customFieldType={state.customFieldType}
                setCustomFieldType={state.setCustomFieldType}
                addCustomField={state.addCustomField}
                removeCustomField={state.removeCustomField}
                bulkImportFields={state.bulkImportFields}
                bodySections={state.bodySections}
                addBodySection={state.addBodySection}
                updateBodySection={state.updateBodySection}
                removeBodySection={state.removeBodySection}
                addFieldToSection={state.addFieldToSection}
                removeFieldFromSection={state.removeFieldFromSection}
                moveFieldInSection={state.moveFieldInSection}
                moveFieldToSection={state.moveFieldToSection}
                reorderBodySections={state.reorderBodySections}
                reorderFieldsAcrossSections={state.reorderFieldsAcrossSections}
              />
            )}
            {activeConfigTab === 'footer' && (
              <FooterConfig
                footerContainers={state.footerContainers}
                addFooterContainer={state.addFooterContainer}
                updateFooterContainer={state.updateFooterContainer}
                removeFooterContainer={state.removeFooterContainer}
                addFooterLink={state.addFooterLink}
                updateFooterLink={state.updateFooterLink}
                removeFooterLink={state.removeFooterLink}
              />
            )}
            {activeConfigTab === 'visibility' && (
              <VisibilityConfig
                masterFields={state.masterFields}
                visTargetField={state.visTargetField}
                setVisTargetField={state.setVisTargetField}
                visLogicalOperator={state.visLogicalOperator}
                setVisLogicalOperator={state.setVisLogicalOperator}
                visConditions={state.visConditions}
                addVisibilityCondition={state.addVisibilityCondition}
                addVisCondition={state.addVisibilityCondition}
                updateVisibilityCondition={state.updateVisibilityCondition}
                updateVisCondition={state.updateVisibilityCondition}
                removeVisibilityCondition={state.removeVisibilityCondition}
                removeVisCondition={state.removeVisibilityCondition}
                generateFieldVisibilityFormula={state.generateFieldVisibilityFormula}
              />
            )}
            {activeConfigTab === 'commandbar' && (
              <CommandBarConfig
                hiddenCommands={state.hiddenCommands}
                handleCommandToggle={state.handleCommandToggle}
                toggleCommandVisibility={state.handleCommandToggle}
                handleSelectAllCommands={state.handleSelectAllCommands}
                handleCategoryCommandsToggle={state.handleCategoryCommandsToggle}
                commandConfigs={state.commandConfigs}
                updateCommandConfig={state.updateCommandConfig}
                resetCommandConfig={state.resetCommandConfig}
                customCommands={state.customCommands}
                addCustomCommand={state.addCustomCommand}
                removeCustomCommand={state.removeCustomCommand}
                applyCommandBarPreset={state.applyCommandBarPreset}
              />
            )}
            {activeConfigTab === 'presets' && (
              <PresetsGallery
                loadPreset={state.loadPreset}
                saveCustomPreset={state.saveCustomPreset}
                loadCustomPreset={state.loadCustomPreset}
                deleteCustomPreset={state.deleteCustomPreset}
                getCustomPresetsList={state.getCustomPresetsList}
                onApplyTheme={state.applyThemeColors}
              />
            )}
          </div>
        </div>

        {/* Right Column: Live Preview & Code View */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-4 lg:sticky lg:top-20">
          <div 
            className="flex bg-slate-200/60 dark:bg-slate-900/90 p-1.5 rounded-2xl w-fit shadow-2xs gap-1 border border-slate-300/40 dark:border-slate-800" 
            role="tablist" 
            aria-label="Preview and code"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeRightTab === 'preview'}
              onClick={() => setActiveRightTab('preview')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all select-none ${
                activeRightTab === 'preview'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Play size={13} className={activeRightTab === 'preview' ? 'text-blue-600 dark:text-blue-400 fill-blue-600/20' : ''} />
              Interactive Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeRightTab === 'code'}
              onClick={() => setActiveRightTab('code')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all select-none ${
                activeRightTab === 'code'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Code size={13} className={activeRightTab === 'code' ? 'text-blue-600 dark:text-blue-400' : ''} />
              Code &amp; Import
            </button>
          </div>

          <div>
            {activeRightTab === 'preview' ? (
              <FormPreview
                headerContainers={state.headerContainers}
                bodySections={state.bodySections}
                footerContainers={state.footerContainers}
                hiddenCommands={state.hiddenCommands}
                commandConfigs={state.commandConfigs}
                customCommands={state.customCommands}
                visTargetField={state.visTargetField}
                visLogicalOperator={state.visLogicalOperator}
                visConditions={state.visConditions}
                masterFields={state.masterFields}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-300/80 dark:border-slate-700/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.25)] min-h-[480px]">
                <JsonOutput
                  activeTab={activeConfigTab === 'presets' ? 'header' : activeConfigTab}
                  generateHeaderJSON={state.generateHeaderJSON}
                  generateBodyJSON={state.generateBodyJSON}
                  generateFooterJSON={state.generateFooterJSON}
                  generateFieldVisibilityFormula={state.generateFieldVisibilityFormula}
                  generateCommandBarJSON={state.generateCommandBarJSON}
                  generateFullBundleJSON={state.generateFullBundleJSON}
                  importJSON={state.importJSON}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
};

export default App;
