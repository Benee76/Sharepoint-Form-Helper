import React from 'react';
import { Plus, Trash2, AlignLeft, AlignCenter, AlignRight, Link2 } from 'lucide-react';
import { VariableChips } from './VariableChips';
import { ColorPicker, InfoTooltip } from './FormHelpers';

export const FooterConfig = ({
  footerContainers,
  addFooterContainer,
  updateFooterContainer,
  removeFooterContainer,
  addFooterLink,
  updateFooterLink,
  removeFooterLink
}) => {
  const fontSizes = [
    { label: 'Small', value: 'ms-font-s' },
    { label: 'Medium', value: 'ms-font-m' },
    { label: 'Large', value: 'ms-font-l' },
    { label: 'Extra Large', value: 'ms-font-xl' },
    { label: 'Super', value: 'ms-font-su' }
  ];

  const insertVariableIntoText = (id, currentVal, variable) => {
    let newVal;
    if (!currentVal.startsWith('=')) {
      newVal = currentVal ? `='${currentVal} ' + ${variable}` : `=${variable}`;
    } else {
      newVal = `${currentVal} + ' ' + ${variable}`;
    }
    updateFooterContainer(id, 'text', newVal);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Footer Blocks</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Configure bottom footer panels and metadata tags.</p>
        </div>
        <button 
          type="button"
          onClick={addFooterContainer}
          className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-3 py-1.5 rounded-md font-semibold transition-colors shadow-sm"
        >
          <Plus size={15} /> Add Container
        </button>
      </div>

      {footerContainers.map((fc, index) => (
        <div 
          key={fc.id} 
          className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4 relative group transition-all"
        >
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
            <span className="font-bold text-slate-500 dark:text-slate-400 text-xs tracking-wide">
              Footer Block {index + 1}
            </span>
            <button 
              type="button"
              onClick={() => removeFooterContainer(fc.id)}
              aria-label="Remove footer block"
              className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Footer Text */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Footer Text Content</label>
            <input 
              type="text" 
              value={fc.text} 
              onChange={(e) => updateFooterContainer(fc.id, 'text', e.target.value)} 
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-800 dark:text-slate-200" 
            />
            <VariableChips onInsert={(v) => insertVariableIntoText(fc.id, fc.text || '', v)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Font Size</label>
              <select 
                value={fc.textSize} 
                onChange={(e) => updateFooterContainer(fc.id, 'textSize', e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-800 dark:text-slate-200"
              >
                {fontSizes.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                Text Visibility 
                <InfoTooltip text="Formula to toggle this text string. E.g. =if([$Status],'inline','none')" />
              </label>
              <input 
                type="text" 
                value={fc.textVis} 
                onChange={(e) => updateFooterContainer(fc.id, 'textVis', e.target.value)} 
                placeholder="e.g. =if([$Status],'inline','none')" 
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-mono text-slate-800 dark:text-slate-200" 
              />
            </div>
          </div>

          {/* Links Configuration */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Link2 size={13} /> Custom Hyperlinks
              </h3>
              <button 
                type="button"
                onClick={() => addFooterLink(fc.id)}
                className="flex items-center gap-1 text-[11px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 font-semibold transition-all"
              >
                <Plus size={13} /> Add Link
              </button>
            </div>

            <div className="space-y-3">
              {fc.links?.map((link) => (
                <div 
                  key={link.id} 
                  className="flex gap-2 items-start bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700 shadow-xs relative"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <input 
                        type="text" 
                        value={link.text} 
                        onChange={(e) => updateFooterLink(fc.id, link.id, 'text', e.target.value)} 
                        placeholder="Link Display Text" 
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200" 
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        value={link.url} 
                        onChange={(e) => updateFooterLink(fc.id, link.id, 'url', e.target.value)} 
                        placeholder="https:// or mailto:" 
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono text-slate-800 dark:text-slate-200" 
                      />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeFooterLink(fc.id, link.id)}
                    aria-label="Remove link"
                    className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {fc.links?.length > 0 && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  Links Visibility
                  <InfoTooltip text="SharePoint condition formula to hide or show ALL links in this container." />
                </label>
                <input 
                  type="text" 
                  value={fc.linksVis} 
                  onChange={(e) => updateFooterContainer(fc.id, 'linksVis', e.target.value)} 
                  placeholder="e.g. =if([$Status]=='Closed','inline','none')" 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-mono text-slate-800 dark:text-slate-200" 
                />
              </div>
            )}
          </div>

          {/* Style Configuration */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Styling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPicker 
                label="Background Color" 
                value={fc.bgColor} 
                onChange={(e) => updateFooterContainer(fc.id, 'bgColor', e.target.value)} 
              />
              <ColorPicker 
                label="Text Color" 
                value={fc.textColor} 
                onChange={(e) => updateFooterContainer(fc.id, 'textColor', e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Alignment</label>
                <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-md w-fit border border-slate-300 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => updateFooterContainer(fc.id, 'align', 'left')} 
                    className={`p-1.5 rounded ${fc.align === 'left' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => updateFooterContainer(fc.id, 'align', 'center')} 
                    className={`p-1.5 rounded ${fc.align === 'center' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => updateFooterContainer(fc.id, 'align', 'right')} 
                    className={`p-1.5 rounded ${fc.align === 'right' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <AlignRight size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  Block Visibility 
                  <InfoTooltip text="Formula to hide or show this entire footer block. E.g. =if([$Status]=='Closed','block','none')." />
                </label>
                <input 
                  type="text" 
                  value={fc.containerVis} 
                  onChange={(e) => updateFooterContainer(fc.id, 'containerVis', e.target.value)} 
                  placeholder="e.g. =if([$Status]=='Closed','block','none')" 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-mono text-slate-800 dark:text-slate-200" 
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {footerContainers.length === 0 && (
        <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">No footer blocks added yet. Click 'Add Container' above.</p>
        </div>
      )}
    </div>
  );
};
