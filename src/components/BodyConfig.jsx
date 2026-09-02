import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical, Type, List, User, Calendar, FileText, CheckSquare, Hash, Search, X } from 'lucide-react';
import { DEFAULT_MASTER_FIELDS, copyToClipboard } from '../lib/formUtils';

export const BodyConfig = ({
  masterFields,
  customFieldName,
  setCustomFieldName,
  customFieldLabel,
  setCustomFieldLabel,
  customFieldType,
  setCustomFieldType,
  addCustomField,
  removeCustomField,
  bulkImportFields,
  bodySections,
  addBodySection,
  updateBodySection,
  removeBodySection,
  addFieldToSection,
  removeFieldFromSection,
  moveFieldInSection,
  moveFieldToSection,
  reorderBodySections,
  reorderFieldsAcrossSections
}) => {
  const [showFieldPool, setShowFieldPool] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [fieldSearch, setFieldSearch] = useState('');

  // Drag and drop state
  const [draggedSectionIndex, setDraggedSectionIndex] = useState(null);
  const [dragOverSectionIndex, setDragOverSectionIndex] = useState(null);

  const [draggedField, setDraggedField] = useState(null); // { sectionId, index, fieldName, fromPool }
  const [dragOverField, setDragOverField] = useState(null); // { sectionId, index }
  const [dragOverSectionTarget, setDragOverSectionTarget] = useState(null); // sectionId

  const defaultFieldNames = DEFAULT_MASTER_FIELDS.map((f) => f.name);
  const usedFields = new Set(bodySections.flatMap((s) => s.fields));

  const handleBulkImport = () => {
    setBulkError('');
    setBulkSuccess(false);
    if (!bulkInput.trim()) {
      setBulkError("Please paste some field data first.");
      return;
    }
    const res = bulkImportFields(bulkInput);
    if (res.success) {
      setBulkSuccess(`Imported ${res.count} column${res.count === 1 ? '' : 's'}.`);
      setBulkInput('');
      setTimeout(() => setBulkSuccess(false), 3000);
    } else {
      setBulkError(res.error || "Failed to parse field inputs.");
    }
  };

  const handleCreateField = () => {
    setFieldError('');
    const res = addCustomField();
    if (res && !res.success) {
      setFieldError(res.error);
    }
  };

  const copyConsoleSnippet = async () => {
    const snippet = `(function() { const columnLinks = Array.from(document.querySelectorAll('a[href*="Field="]')); const fields = columnLinks.map(link => { const url = new URL(link.href, window.location.origin); const internalName = url.searchParams.get('Field'); const displayName = link.textContent.trim(); const row = link.closest('tr'); let typeText = 'text'; if (row) { const cells = row.querySelectorAll('td'); if (cells.length > 1) { const rawType = cells[1].textContent.trim().toLowerCase(); if (rawType.includes('choice')) typeText = 'choice'; else if (rawType.includes('person') || rawType.includes('user') || rawType.includes('group')) typeText = 'user'; else if (rawType.includes('date')) typeText = 'date'; else if (rawType.includes('multiple lines') || rawType.includes('note')) typeText = 'note'; else if (rawType.includes('yes/no') || rawType.includes('boolean')) typeText = 'boolean'; else if (rawType.includes('number')) typeText = 'number'; } } return { name: internalName, label: displayName, type: typeText }; }).filter(f => f.name && !f.name.startsWith('_')); copy(JSON.stringify(fields, null, 2)); console.log("SUCCESS: Scraped fields copied to clipboard!", fields); })();`;
    const ok = await copyToClipboard(snippet);
    if (ok) {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  const getFieldIcon = (type) => {
    switch (type) {
      case 'choice': return <List size={13} className="text-amber-500 flex-shrink-0" />;
      case 'user': return <User size={13} className="text-indigo-500 flex-shrink-0" />;
      case 'date': return <Calendar size={13} className="text-emerald-500 flex-shrink-0" />;
      case 'note': return <FileText size={13} className="text-pink-500 flex-shrink-0" />;
      case 'boolean': return <CheckSquare size={13} className="text-cyan-500 flex-shrink-0" />;
      case 'number': return <Hash size={13} className="text-blue-500 flex-shrink-0" />;
      default: return <Type size={13} className="text-slate-500 flex-shrink-0" />;
    }
  };

  // Section Drag & Drop Handlers
  const handleSectionDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'section', index }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSectionIndex(index);
  };

  const handleSectionDragOver = (e, index) => {
    if (draggedSectionIndex !== null && draggedSectionIndex !== index) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverSectionIndex(index);
    }
  };

  const handleSectionDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedSectionIndex !== null && draggedSectionIndex !== targetIndex && reorderBodySections) {
      reorderBodySections(draggedSectionIndex, targetIndex);
    }
    setDraggedSectionIndex(null);
    setDragOverSectionIndex(null);
  };

  const handleSectionDragEnd = () => {
    setDraggedSectionIndex(null);
    setDragOverSectionIndex(null);
  };

  // Field Drag & Drop Handlers
  const handleFieldDragStart = (e, sectionId, index, fieldName) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'field', sectionId, index, fieldName }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedField({ sectionId, index, fieldName, fromPool: false });
  };

  const handlePoolFieldDragStart = (e, fieldName) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'field', fieldName, fromPool: true }));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedField({ fieldName, fromPool: true });
  };

  const handleFieldDragOver = (e, sectionId, index) => {
    if (draggedField) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = draggedField.fromPool ? 'copy' : 'move';
      setDragOverField({ sectionId, index });
    }
  };

  const handleSectionAreaDragOver = (e, sectionId) => {
    if (draggedField) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = draggedField.fromPool ? 'copy' : 'move';
      setDragOverSectionTarget(sectionId);
    }
  };

  const handleFieldDrop = (e, targetSectionId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedField) {
      if (draggedField.fromPool) {
        addFieldToSection(targetSectionId, draggedField.fieldName);
      } else if (reorderFieldsAcrossSections) {
        reorderFieldsAcrossSections(draggedField.sectionId, draggedField.index, targetSectionId, targetIndex);
      }
    }
    setDraggedField(null);
    setDragOverField(null);
    setDragOverSectionTarget(null);
  };

  const handleFieldDragEnd = () => {
    setDraggedField(null);
    setDragOverField(null);
    setDragOverSectionTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Section */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Body Sections & Columns</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Drag to arrange sections or fields, or use the controls below.</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setShowFieldPool(!showFieldPool)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
              showFieldPool 
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {showFieldPool ? 'Hide Fields Pool' : 'Manage Fields Pool'}
          </button>
          <button 
            type="button"
            onClick={addBodySection}
            className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-3 py-1.5 rounded-md font-semibold transition-colors shadow-sm"
          >
            <Plus size={15} /> Add Section
          </button>
        </div>
      </div>

      {/* Field Pool Area */}
      {showFieldPool && (
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 rounded-lg space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Create Custom Field</h3>
            <div className="flex flex-col md:flex-row gap-2">
              <input 
                type="text"
                value={customFieldName}
                onChange={(e) => setCustomFieldName(e.target.value)}
                placeholder="Internal Name (e.g. ProjectCost)"
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateField(); }}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-mono"
              />
              <input 
                type="text"
                value={customFieldLabel}
                onChange={(e) => setCustomFieldLabel(e.target.value)}
                placeholder="Outside Name / Display Label (e.g. Project Cost)"
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              />
              <select 
                value={customFieldType}
                onChange={(e) => setCustomFieldType(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
              >
                <option value="text">Single Line Text</option>
                <option value="note">Multiple Line Text (Note)</option>
                <option value="choice">Choice</option>
                <option value="number">Number</option>
                <option value="boolean">Yes / No (Boolean)</option>
                <option value="user">Person or Group (User)</option>
                <option value="date">Date and Time</option>
              </select>
              <button 
                type="button"
                onClick={handleCreateField}
                disabled={!customFieldName.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-4 py-1.5 rounded font-semibold transition-colors"
              >
                Create Field
              </button>
            </div>
            {fieldError && (
              <p className="text-xs text-red-500 font-semibold mt-2">{fieldError}</p>
            )}
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Available Fields Pool ({
                  fieldSearch.trim() 
                    ? `${masterFields.filter(f => {
                        const q = fieldSearch.toLowerCase().trim();
                        return f.label.toLowerCase().includes(q) || f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q);
                      }).length} of ${masterFields.length}` 
                    : masterFields.length
                })
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">Drag any chip directly into a section</span>
            </div>

            {/* Instant Search / Filter Input */}
            <div className="relative mb-2.5">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={fieldSearch}
                onChange={(e) => setFieldSearch(e.target.value)}
                placeholder="Filter fields by name, internal column, or type..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {fieldSearch && (
                <button
                  type="button"
                  onClick={() => setFieldSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Clear filter"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              {masterFields
                .filter((f) => {
                  if (!fieldSearch.trim()) return true;
                  const q = fieldSearch.toLowerCase().trim();
                  return f.label.toLowerCase().includes(q) || f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q);
                })
                .map((f) => {
                  const isUsed = usedFields.has(f.name);
                  return (
                    <div 
                      key={f.name}
                      draggable
                      onDragStart={(e) => handlePoolFieldDragStart(e, f.name)}
                      onDragEnd={handleFieldDragEnd}
                      className={`flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border rounded text-xs font-medium cursor-grab active:cursor-grabbing hover:shadow-sm transition-all select-none group ${
                        isUsed 
                          ? 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 opacity-75' 
                          : 'border-blue-200 dark:border-blue-900/50 text-slate-700 dark:text-slate-200 hover:border-blue-400'
                      }`}
                      title="Drag into any section"
                    >
                      <GripVertical size={11} className="text-slate-400 group-hover:text-blue-500" />
                      {getFieldIcon(f.type)}
                      <span className="font-semibold">{f.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">[{f.name}]</span>
                      
                      {!defaultFieldNames.includes(f.name) && (
                        <button 
                          type="button"
                          onClick={() => removeCustomField(f.name)}
                          className="text-slate-400 hover:text-red-500 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete custom field"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Bulk Field Importer block */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Bulk Import Columns</h3>
              <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded font-bold select-none">
                No Graph API Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-lg text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              <div className="space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Method A: Plain Text List</span>
                <p>Paste a list of column names separated by commas or lines (e.g. <code>Target Date, Cost, Stage</code>). The app will automatically generate internal names.</p>
              </div>
              
              <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2.5 md:pt-0 md:pl-4">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Method B: List Settings Scraper</span>
                <p>1. Go to your SharePoint <strong>List Settings</strong> page.</p>
                <p>2. Open F12 Browser console, paste the script below, and hit Enter.</p>
                <p>3. Paste the copied clipboard contents directly into the box below.</p>
              </div>
            </div>

            {/* Copy Script Container */}
            <div className="flex gap-2 items-center bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate flex-1 select-all">
                (function()&#123;const cols=Array.from(document.querySelectorAll('a[href*="Field="]'));copy(JSON.stringify(cols.map(...)))&#125;)()
              </span>
              <button
                type="button"
                onClick={copyConsoleSnippet}
                className="px-3 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-semibold transition-all active:scale-95 flex-shrink-0"
              >
                {copiedSnippet ? 'Copied Scraper!' : 'Copy F12 Script'}
              </button>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Paste scraped F12 JSON data OR a comma-separated list of labels..."
                  rows={2}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleBulkImport}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded font-semibold transition-colors flex-shrink-0 h-9"
              >
                Import
              </button>
            </div>

            {bulkSuccess && (
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold">{bulkSuccess}</p>
            )}
            {bulkError && (
              <p className="text-xs text-red-500 font-semibold">{bulkError}</p>
            )}
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {bodySections.map((sec, secIdx) => {
          const isSectionDragging = draggedSectionIndex === secIdx;
          const isSectionDragOver = dragOverSectionIndex === secIdx;

          return (
            <div 
              key={sec.id}
              draggable
              onDragStart={(e) => handleSectionDragStart(e, secIdx)}
              onDragOver={(e) => handleSectionDragOver(e, secIdx)}
              onDrop={(e) => handleSectionDrop(e, secIdx)}
              onDragEnd={handleSectionDragEnd}
              className={`p-4 bg-slate-50 dark:bg-slate-800/60 border rounded-lg relative transition-all ${
                isSectionDragging 
                  ? 'opacity-40 border-dashed border-blue-500' 
                  : isSectionDragOver 
                    ? 'border-blue-500 ring-2 ring-blue-400/40 bg-blue-50/20 dark:bg-blue-950/20' 
                    : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Section Header */}
              <div className="flex justify-between items-start gap-3 mb-4">
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                    title="Drag to reorder section"
                  >
                    <GripVertical size={16} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Section {secIdx + 1} Title
                    </label>
                    <input 
                      type="text" 
                      value={sec.title} 
                      onChange={(e) => updateBodySection(sec.id, 'title', e.target.value)} 
                      className="w-full md:w-80 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-5">
                  <button 
                    type="button"
                    onClick={() => removeBodySection(sec.id)}
                    aria-label={`Remove section ${secIdx + 1}`}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Fields Visual List & Drop Area */}
              <div 
                className={`space-y-2 mb-4 p-2 rounded-lg transition-colors ${
                  dragOverSectionTarget === sec.id ? 'bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-400' : ''
                }`}
                onDragOver={(e) => handleSectionAreaDragOver(e, sec.id)}
                onDrop={(e) => handleFieldDrop(e, sec.id, sec.fields.length)}
              >
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Assigned Fields ({sec.fields.length})
                  </label>
                  {sec.fields.length > 0 && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">Drag to reorder or move across sections</span>
                  )}
                </div>

                {sec.fields.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-md divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                    {sec.fields.map((fName, idx) => {
                      const fieldDetail = masterFields.find(mf => mf.name === fName) || { name: fName, label: fName, type: 'text' };
                      const isFieldDragging = draggedField && !draggedField.fromPool && draggedField.sectionId === sec.id && draggedField.index === idx;
                      const isFieldDragOver = dragOverField && dragOverField.sectionId === sec.id && dragOverField.index === idx;

                      return (
                        <div 
                          key={`${sec.id}-${fName}`}
                          draggable
                          onDragStart={(e) => handleFieldDragStart(e, sec.id, idx, fName)}
                          onDragOver={(e) => handleFieldDragOver(e, sec.id, idx)}
                          onDrop={(e) => handleFieldDrop(e, sec.id, idx)}
                          onDragEnd={handleFieldDragEnd}
                          className={`flex items-center justify-between p-2.5 transition-all select-none ${
                            isFieldDragging
                              ? 'opacity-30 bg-slate-100 dark:bg-slate-800 border-dashed border-blue-400'
                              : isFieldDragOver
                                ? 'bg-blue-50 dark:bg-blue-950/40 border-t-2 border-t-blue-500'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div 
                              className="cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              title="Drag field"
                            >
                              <GripVertical size={13} />
                            </div>
                            {getFieldIcon(fieldDetail.type)}
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{fieldDetail.label}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex-shrink-0">[{fieldDetail.name}]</span>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            <button 
                              type="button"
                              onClick={() => moveFieldInSection(sec.id, idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                              title="Move Up"
                              aria-label="Move field up"
                            >
                              <ChevronUp size={15} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => moveFieldInSection(sec.id, idx, 'down')}
                              disabled={idx === sec.fields.length - 1}
                              className="p-1 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                              title="Move Down"
                              aria-label="Move field down"
                            >
                              <ChevronDown size={15} />
                            </button>

                            {bodySections.length > 1 && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    moveFieldToSection(sec.id, parseInt(e.target.value, 10), fName);
                                  }
                                }}
                                value=""
                                aria-label={`Move ${fieldDetail.label} to another section`}
                                className="text-xs border border-slate-300 dark:border-slate-700 rounded py-0.5 px-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                              >
                                <option value="" disabled>Move Section...</option>
                                {bodySections.filter(s => s.id !== sec.id).map(s => (
                                  <option key={s.id} value={s.id}>
                                    {s.title || `Section`}
                                  </option>
                                ))}
                              </select>
                            )}

                            <button 
                              type="button"
                              onClick={() => removeFieldFromSection(sec.id, fName)}
                              aria-label={`Remove field ${fieldDetail.label}`}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors ml-1"
                              title="Remove Field"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-5 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-md">
                    <p className="text-xs text-slate-400 dark:text-slate-500">No fields assigned. Drag fields here or select from dropdown below.</p>
                  </div>
                )}
              </div>

              {/* Quick Add Field to Section */}
              <div className="flex gap-2 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-2 w-fit">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1">Add field:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addFieldToSection(sec.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  aria-label={`Add field to section ${sec.title}`}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" disabled>Select a field...</option>
                  {masterFields
                    .filter(f => !usedFields.has(f.name))
                    .map(f => (
                      <option key={f.name} value={f.name}>
                        {f.label} ({f.type})
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {bodySections.length === 0 && (
        <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">No body sections defined. Click 'Add Section' to start.</p>
        </div>
      )}
    </div>
  );
};

