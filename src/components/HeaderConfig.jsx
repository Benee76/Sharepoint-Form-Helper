import React from 'react';
import { Plus, Trash2, AlignLeft, AlignCenter, AlignRight, HelpCircle } from 'lucide-react';
import { VariableChips } from './VariableChips';
import { ColorPicker, InfoTooltip } from './FormHelpers';

export const HeaderConfig = ({ 
  headerContainers, 
  addHeaderContainer, 
  updateHeaderContainer, 
  removeHeaderContainer 
}) => {
  const fontSizes = [
    { label: 'Small', value: 'ms-font-s' },
    { label: 'Medium', value: 'ms-font-m' },
    { label: 'Large', value: 'ms-font-l' },
    { label: 'Extra Large', value: 'ms-font-xl' },
    { label: 'Super', value: 'ms-font-su' }
  ];

  const insertVariableIntoTitle = (id, currentVal, variable) => {
    let newVal;
    if (!currentVal.startsWith('=')) {
      newVal = currentVal ? `='${currentVal} ' + ${variable}` : `=${variable}`;
    } else {
      newVal = `${currentVal} + ' ' + ${variable}`;
    }
    updateHeaderContainer(id, 'title', newVal);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Header Blocks</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure top header sections for the SharePoint form.</p>
        </div>
        <button 
          type="button"
          onClick={addHeaderContainer}
          className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-3 py-1.5 rounded-md font-semibold transition-colors shadow-sm"
        >
          <Plus size={15} /> Add Container
        </button>
      </div>

      {headerContainers.map((hc, index) => (
        <div 
          key={hc.id} 
          className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4 relative group transition-all"
        >
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
            <span className="font-bold text-slate-500 dark:text-slate-400 text-xs tracking-wide">
              Header Block {index + 1}
            </span>
            <button 
              type="button"
              onClick={() => removeHeaderContainer(hc.id)}
              aria-label="Remove header block"
              className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Title input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Title Text</label>
            <input 
              type="text" 
              value={hc.title} 
              onChange={(e) => updateHeaderContainer(hc.id, 'title', e.target.value)} 
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-800 dark:text-slate-200" 
            />
            <VariableChips onInsert={(v) => insertVariableIntoTitle(hc.id, hc.title || '', v)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Font Size</label>
              <select 
                value={hc.textSize} 
                onChange={(e) => updateHeaderContainer(hc.id, 'textSize', e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-800 dark:text-slate-200"
              >
                {fontSizes.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                Text Visibility 
                <InfoTooltip text="Use a SharePoint formula to hide or show the text. E.g., =if([$Status] == 'Done', 'block', 'none'). Leave blank to always show." />
              </label>
              <input 
                type="text" 
                value={hc.titleVis} 
                onChange={(e) => updateHeaderContainer(hc.id, 'titleVis', e.target.value)} 
                placeholder="e.g. =if([$Id],'block','none')" 
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-mono text-slate-800 dark:text-slate-200" 
              />
            </div>
          </div>

          {/* Icon configuration */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                Show Icon
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={hc.showIcon || false} 
                  onChange={() => updateHeaderContainer(hc.id, 'showIcon', !hc.showIcon)} 
                />
                <div className="w-9 h-5 bg-slate-300 dark:bg-slate-600 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {hc.showIcon && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex justify-between items-center">
                    <span>Fluent Icon Name</span>
                    <a 
                      href="https://developer.microsoft.com/en-us/fluentui#/styles/web/icons" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-blue-500 hover:underline flex items-center gap-0.5"
                    >
                      Browse <HelpCircle size={11} />
                    </a>
                  </label>
                  <input 
                    type="text" 
                    value={hc.icon} 
                    onChange={(e) => updateHeaderContainer(hc.id, 'icon', e.target.value)} 
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-800 dark:text-slate-200" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    Icon Visibility 
                    <InfoTooltip text="Formula to control icon visibility. Leave blank to always show." />
                  </label>
                  <input 
                    type="text" 
                    value={hc.iconVis} 
                    onChange={(e) => updateHeaderContainer(hc.id, 'iconVis', e.target.value)} 
                    placeholder="e.g. =if([$Status]=='New','block','none')" 
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-mono text-slate-800 dark:text-slate-200" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Style Configuration */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Styling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPicker 
                label="Background Color" 
                value={hc.bgColor} 
                onChange={(e) => updateHeaderContainer(hc.id, 'bgColor', e.target.value)} 
              />
              <ColorPicker 
                label="Text Color" 
                value={hc.textColor} 
                onChange={(e) => updateHeaderContainer(hc.id, 'textColor', e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Alignment</label>
                <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-md w-fit border border-slate-300 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => updateHeaderContainer(hc.id, 'align', 'flex-start')} 
                    className={`p-1.5 rounded ${hc.align === 'flex-start' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => updateHeaderContainer(hc.id, 'align', 'center')} 
                    className={`p-1.5 rounded ${hc.align === 'center' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => updateHeaderContainer(hc.id, 'align', 'flex-end')} 
                    className={`p-1.5 rounded ${hc.align === 'flex-end' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <AlignRight size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  Block Visibility 
                  <InfoTooltip text="Formula to control whether this entire block is visible. E.g. =if([$Status]=='Active','flex','none')." />
                </label>
                <input 
                  type="text" 
                  value={hc.containerVis} 
                  onChange={(e) => updateHeaderContainer(hc.id, 'containerVis', e.target.value)} 
                  placeholder="e.g. =if([$Status]=='Active','flex','none')" 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-mono text-slate-800 dark:text-slate-200" 
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {headerContainers.length === 0 && (
        <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">No header blocks added yet. Click 'Add Container' above.</p>
        </div>
      )}
    </div>
  );
};
