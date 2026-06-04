import React, { useState } from 'react';
import { LayoutTemplate, PanelBottom, ToggleLeft, Copy, CheckCircle2, LayoutList, Plus, Trash2, HelpCircle, AlignLeft, AlignCenter, AlignRight, EyeOff, Settings2, Info, Settings, AlertCircle, Check, Mail, User, FileText, Calendar, Link as LinkIcon } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('header');
  const [copied, setCopied] = useState(false);

  // --- Header State ---
  const [headerContainers, setHeaderContainers] = useState([
    {
      id: 1,
      title: "='Form for ' + [$Title]",
      textSize: 'ms-font-xl',
      titleVis: '',
      showIcon: true,
      icon: 'PageHeaderEdit',
      iconVis: '',
      bgColor: '#0078d4',
      textColor: '#ffffff',
      containerVis: '',
      align: 'flex-start'
    }
  ]);
  
  // --- Body (Layout) State ---
  const [bodySections, setBodySections] = useState([
    { id: 1, title: 'General Information', fields: 'Title, Status, AssignedTo' },
    { id: 2, title: 'Details', fields: 'Description, StartDate, DueDate' }
  ]);

  // --- Footer State ---
  const [footerContainers, setFooterContainers] = useState([
    {
      id: 1,
      text: "='Created on ' + [$Created] + ' by ' + [$Author.title]",
      textSize: 'ms-font-m',
      textVis: '',
      links: [{ id: 1, text: 'IT Support', url: 'mailto:it@company.com' }],
      linksVis: '',
      bgColor: '#ffffff',
      textColor: '#605e5c',
      containerVis: '',
      align: 'left'
    }
  ]);

  // --- Field Visibility State ---
  const [visField, setVisField] = useState('Status');
  const [visFieldType, setVisFieldType] = useState('choice');
  const [visCondition, setVisCondition] = useState('==');
  const [visValue, setVisValue] = useState('Completed');

  // --- Command Bar State ---
  const [hiddenCommands, setHiddenCommands] = useState({
    new: false, edit: false, editInGridView: false, share: false, copyLink: false,
    delete: false, download: false, automate: false, integrate: false, export: false,
    emptyRecycleBin: false, copilotCreate: false
  });

  const commandLabels = {
    new: 'New', edit: 'Edit', editInGridView: 'Edit in grid view', share: 'Share', 
    copyLink: 'Copy link', delete: 'Delete', download: 'Download', automate: 'Automate', 
    integrate: 'Integrate', export: 'Export', emptyRecycleBin: 'Empty recycle bin', 
    copilotCreate: 'Create Copilot Agent'
  };

  const fontSizes = [
    { label: 'Small', value: 'ms-font-s' },
    { label: 'Medium', value: 'ms-font-m' },
    { label: 'Large', value: 'ms-font-l' },
    { label: 'Extra Large', value: 'ms-font-xl' },
    { label: 'Super', value: 'ms-font-su' }
  ];

  // --- Handlers ---
  const handleCommandToggle = (cmd) => setHiddenCommands(prev => ({ ...prev, [cmd]: !prev[cmd] }));

  const handleSelectAllCommands = () => {
    const isAllSelected = Object.values(hiddenCommands).every(v => v);
    const newCommands = Object.keys(hiddenCommands).reduce((acc, key) => { acc[key] = !isAllSelected; return acc; }, {});
    setHiddenCommands(newCommands);
  };

  // Body Handlers
  const addBodySection = () => setBodySections([...bodySections, { id: Date.now(), title: 'New Section', fields: '' }]);
  const updateBodySection = (id, key, value) => setBodySections(bodySections.map(sec => sec.id === id ? { ...sec, [key]: value } : sec));
  const removeBodySection = (id) => setBodySections(bodySections.filter(sec => sec.id !== id));

  // Header Handlers
  const addHeaderContainer = () => setHeaderContainers([...headerContainers, { id: Date.now(), title: 'New Header Block', textSize: 'ms-font-xl', titleVis: '', showIcon: false, icon: 'Info', iconVis: '', bgColor: '#f3f2f1', textColor: '#323130', containerVis: '', align: 'flex-start' }]);
  const updateHeaderContainer = (id, key, value) => setHeaderContainers(headerContainers.map(hc => hc.id === id ? { ...hc, [key]: value } : hc));
  const removeHeaderContainer = (id) => setHeaderContainers(headerContainers.filter(hc => hc.id !== id));

  // Footer Handlers
  const addFooterContainer = () => setFooterContainers([...footerContainers, { id: Date.now(), text: 'New Footer Info', textSize: 'ms-font-m', textVis: '', links: [], linksVis: '', bgColor: '#f3f2f1', textColor: '#323130', containerVis: '', align: 'left' }]);
  const updateFooterContainer = (id, key, value) => setFooterContainers(footerContainers.map(fc => fc.id === id ? { ...fc, [key]: value } : fc));
  const removeFooterContainer = (id) => setFooterContainers(footerContainers.filter(fc => fc.id !== id));
  
  const addFooterLink = (containerId) => {
    setFooterContainers(footerContainers.map(fc => fc.id === containerId ? { ...fc, links: [...fc.links, { id: Date.now(), text: 'New Link', url: 'https://' }] } : fc));
  };
  const updateFooterLink = (containerId, linkId, key, value) => {
    setFooterContainers(footerContainers.map(fc => fc.id === containerId ? { ...fc, links: fc.links.map(link => link.id === linkId ? { ...link, [key]: value } : link) } : fc));
  };
  const removeFooterLink = (containerId, linkId) => {
    setFooterContainers(footerContainers.map(fc => fc.id === containerId ? { ...fc, links: fc.links.filter(link => link.id !== linkId) } : fc));
  };

  const handleFieldTypeChange = (e) => {
    const newType = e.target.value;
    setVisFieldType(newType);
    if (newType === 'boolean') {
      setVisValue('true');
      if (visCondition === '>' || visCondition === '<') setVisCondition('==');
    } else if (visFieldType === 'boolean') setVisValue('');
  };

  const insertVariableIntoArray = (setter, id, key, variable) => {
    setter(prev => prev.map(item => {
      if (item.id === id) {
        const currentVal = item[key] || '';
        let newVal;
        if (!currentVal.startsWith('=')) {
          newVal = currentVal ? `='${currentVal} ' + ${variable}` : `=${variable}`;
        } else {
          newVal = `${currentVal} + ' ' + ${variable}`;
        }
        return { ...item, [key]: newVal };
      }
      return item;
    }));
  };

  // --- Utility ---
  const parseSPExpression = (exp) => {
    if (!exp) return '';
    if (!exp.startsWith('=')) return exp;
    let parsed = exp.substring(1);
    parsed = parsed.replace(/\+/g, '');
    parsed = parsed.replace(/'/g, ''); // Strip single quotes
    parsed = parsed.replace(/"/g, ''); // Strip double quotes just in case
    parsed = parsed.replace(/\[\$([^\]]+)\]/g, '[$1]');
    return parsed.replace(/\s+/g, ' ').trim();
  };

  // --- Generators ---
  const generateHeaderJSON = () => {
    if (headerContainers.length === 0) return {};

    const children = headerContainers.map(hc => {
      const innerChildren = [];
      if (hc.showIcon) {
        innerChildren.push({ elmType: "span", attributes: { iconName: hc.icon, class: "ms-font-xl" }, style: { "margin-right": "16px", "display": hc.iconVis || "block" } });
      }
      if (hc.title) {
        innerChildren.push({ elmType: "div", attributes: { class: `${hc.textSize} ms-fontWeight-semibold` }, style: { "display": hc.titleVis || "block" }, txtContent: hc.title });
      }
      return {
        elmType: "div",
        attributes: { class: "ms-padding-20" },
        style: {
          "padding": "20px 24px",
          "background-color": hc.bgColor, "color": hc.textColor,
          "display": hc.containerVis || "flex", "align-items": "center", "justify-content": hc.align,
          "border-radius": "4px", "margin-bottom": "10px"
        },
        children: innerChildren
      };
    });

    if (children.length === 1) return children[0];
    return { elmType: "div", style: { "display": "flex", "flex-direction": "column", "width": "100%" }, children };
  };

  const generateBodyJSON = () => ({
    sections: bodySections.map(sec => ({ displayname: sec.title, fields: sec.fields.split(',').map(f => f.trim()).filter(f => f) }))
  });

  const generateFooterJSON = () => {
    if (footerContainers.length === 0) return {};

    const children = footerContainers.map(fc => {
      const innerChildren = [];
      if (fc.text) {
        innerChildren.push({ elmType: "span", attributes: { class: fc.textSize }, style: { "display": fc.textVis || "inline" }, txtContent: fc.text });
      }
      if (fc.links.length > 0) {
        const linkChildren = fc.links.map((link, idx) => ({
          elmType: "a", txtContent: link.text, attributes: { target: "_blank", href: link.url },
          style: { 
            "color": fc.textColor !== '#605e5c' ? fc.textColor : '#0078d4', "text-decoration": "none", "font-weight": "600", 
            "margin-left": idx === 0 && !fc.text ? "0px" : "6px", "margin-right": "6px", "font-size": "inherit" 
          }
        }));
        innerChildren.push({ elmType: "span", attributes: { class: fc.textSize }, style: { "display": fc.linksVis || "inline" }, children: linkChildren });
      }
      return {
        elmType: "div",
        style: { "width": "100%", "text-align": fc.align, "padding": "20px 24px", "background-color": fc.bgColor, "color": fc.textColor, "display": fc.containerVis || "block" },
        children: innerChildren
      };
    });

    if (children.length === 1) {
      children[0].style["border-top"] = "1px solid #eaeaea";
      children[0].style["margin-top"] = "20px";
      return children[0];
    }
    
    return {
      elmType: "div",
      style: { "width": "100%", "border-top": "1px solid #eaeaea", "margin-top": "20px", "display": "flex", "flex-direction": "column", "overflow": "hidden" },
      children
    };
  };

  const generateFieldVisibilityFormula = () => {
    if (visFieldType === 'boolean') return `=[$${visField}] ${visCondition} ${visValue === 'false' ? 'false' : 'true'}`;
    return `=[$${visField}] ${visCondition} ${isNaN(visValue) ? `'${visValue}'` : visValue}`;
  };

  const generateCommandBarJSON = () => {
    const commandsToHide = Object.keys(hiddenCommands).filter(key => hiddenCommands[key]).map(key => ({ key, hide: true }));
    if (commandsToHide.length === 0) return { commandBarProps: { commands: [] } };
    return { commandBarProps: { commands: commandsToHide } };
  };

  const getCurrentJSON = () => {
    switch (activeTab) {
      case 'header': return generateHeaderJSON();
      case 'body': return generateBodyJSON();
      case 'footer': return generateFooterJSON();
      case 'commandbar': return generateCommandBarJSON();
      case 'visibility': return { description: "Copy formula to SharePoint 'Edit conditional formula' setting.", formula: generateFieldVisibilityFormula() };
      default: return {};
    }
  };

  const copyToClipboard = () => {
    const content = activeTab === 'visibility' ? generateFieldVisibilityFormula() : JSON.stringify(getCurrentJSON(), null, 2);
    try {
      const tempInput = document.createElement('textarea');
      tempInput.value = content;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // --- UI Components ---
  const VariableChips = ({ onInsert }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      <span className="text-xs text-slate-500 font-medium flex items-center">Insert:</span>
      {['[$Title]', '[$Created]', '[$Modified]', '[$Author.title]', '[$Editor.title]', '@me'].map(v => (
        <button key={v} onClick={() => onInsert(v)} className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded border border-slate-300 transition-colors font-mono">{v}</button>
      ))}
    </div>
  );

  const ColorPicker = ({ value, onChange, label }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded border border-slate-300 shadow-inner relative overflow-hidden flex-shrink-0" style={{ backgroundColor: value }}>
          <input type="color" value={value} onChange={onChange} className="absolute inset-[-50%] w-[200%] h-[200%] opacity-0 cursor-pointer" />
        </div>
        <input type="text" value={value} onChange={onChange} className="flex-1 px-2 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm uppercase font-mono" />
      </div>
    </div>
  );

  const InfoTooltip = ({ text }) => (
    <div className="relative inline-flex items-center ml-1">
      <HelpCircle size={14} className="peer text-slate-400 cursor-help hover:text-blue-500 transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden peer-hover:block bg-slate-800 text-white text-xs p-2.5 rounded w-64 z-50 text-center shadow-lg font-sans font-normal pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );

  const renderPreviewIcon = (iconName) => {
    const n = (iconName || '').toLowerCase();
    if (n.includes('info')) return <Info size={24} />;
    if (n.includes('setting') || n.includes('gear')) return <Settings size={24} />;
    if (n.includes('alert') || n.includes('warning') || n.includes('error')) return <AlertCircle size={24} />;
    if (n.includes('check') || n.includes('tick')) return <Check size={24} />;
    if (n.includes('mail')) return <Mail size={24} />;
    if (n.includes('user') || n.includes('person')) return <User size={24} />;
    if (n.includes('file') || n.includes('doc')) return <FileText size={24} />;
    if (n.includes('calendar') || n.includes('date')) return <Calendar size={24} />;
    if (n.includes('link')) return <LinkIcon size={24} />;
    return <LayoutTemplate size={24} />;
  };

  const mapSPFontToTailwind = (spClass) => {
    const map = { 'ms-font-s': 'text-xs', 'ms-font-m': 'text-sm', 'ms-font-l': 'text-base', 'ms-font-xl': 'text-xl', 'ms-font-su': 'text-3xl' };
    return map[spClass] || 'text-sm';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Main Header */}
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-2 rounded-lg">
              <ToggleLeft size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sharepoint Form Helper</h1>
              <p className="text-slate-400 text-sm">JSON generation for SharePoint views and forms.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Controls Panel */}
          <div className="w-full flex flex-col gap-4">
            
            {/* Tabs */}
            <div className="flex flex-wrap bg-white rounded-lg shadow-sm p-1 border border-slate-200 gap-1">
              <button onClick={() => setActiveTab('header')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'header' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><LayoutTemplate size={16} /> Header</button>
              <button onClick={() => setActiveTab('body')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'body' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><LayoutList size={16} /> Body</button>
              <button onClick={() => setActiveTab('footer')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'footer' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><PanelBottom size={16} /> Footer</button>
              <button onClick={() => setActiveTab('visibility')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'visibility' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><EyeOff size={16} /> Fields</button>
              <button onClick={() => setActiveTab('commandbar')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'commandbar' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><ToggleLeft size={16} /> Cmd Bar</button>
            </div>

            {/* Form Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 overflow-y-auto" style={{maxHeight: '650px'}}>
              
              {/* HEADER TAB */}
              {activeTab === 'header' && (
                <div className="space-y-6">
                  <div className="border-b pb-3 flex justify-between items-end">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">Header Layout</h2>
                      <p className="text-sm text-slate-500 mt-1">Configure top section containers.</p>
                    </div>
                    <button onClick={addHeaderContainer} className="flex items-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md font-medium transition-colors border border-blue-200">
                      <Plus size={16} /> Add Container
                    </button>
                  </div>

                  {headerContainers.map((hc, index) => (
                    <div key={hc.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 relative group">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="font-semibold text-slate-600 uppercase text-xs tracking-wider">Header Block {index + 1}</span>
                        <button onClick={() => removeHeaderContainer(hc.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-slate-700 flex items-center gap-2"><Settings2 size={16} /> Title Text</h3></div>
                        <div>
                          <input type="text" value={hc.title} onChange={(e) => updateHeaderContainer(hc.id, 'title', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
                          <VariableChips onInsert={(v) => insertVariableIntoArray(setHeaderContainers, hc.id, 'title', v)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Font Size</label>
                            <select value={hc.textSize} onChange={(e) => updateHeaderContainer(hc.id, 'textSize', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                              {fontSizes.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 uppercase flex items-center">Visibility <InfoTooltip text="Use a SharePoint formula to hide or show this element. E.g., =if([$Status] == 'Done', 'block', 'none'). Leave blank to always show." /></label>
                            <input type="text" value={hc.titleVis} onChange={(e) => updateHeaderContainer(hc.id, 'titleVis', e.target.value)} placeholder="e.g. =if([$Id],'block','none')" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono" />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Settings2 size={16} /> Icon</h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={hc.showIcon} onChange={() => updateHeaderContainer(hc.id, 'showIcon', !hc.showIcon)} />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        {hc.showIcon && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase flex justify-between">Fluent Icon Name <a href="https://developer.microsoft.com/en-us/fluentui#/styles/web/icons" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline"><HelpCircle size={14} /></a></label>
                              <input type="text" value={hc.icon} onChange={(e) => updateHeaderContainer(hc.id, 'icon', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-600 mb-1 uppercase flex items-center">Visibility <InfoTooltip text="Formula to control icon visibility. Leave blank to always show." /></label>
                              <input type="text" value={hc.iconVis} onChange={(e) => updateHeaderContainer(hc.id, 'iconVis', e.target.value)} placeholder="e.g. =if([$Status]=='New','block','none')" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-200 pt-4 space-y-4">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Settings2 size={16} /> Container Styling</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <ColorPicker label="Background Color" value={hc.bgColor} onChange={(e) => updateHeaderContainer(hc.id, 'bgColor', e.target.value)} />
                          <ColorPicker label="Text Color" value={hc.textColor} onChange={(e) => updateHeaderContainer(hc.id, 'textColor', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-end">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Alignment</label>
                            <div className="flex bg-slate-200 p-1 rounded-md w-fit">
                              <button onClick={() => updateHeaderContainer(hc.id, 'align', 'flex-start')} className={`p-1.5 rounded ${hc.align === 'flex-start' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><AlignLeft size={18} /></button>
                              <button onClick={() => updateHeaderContainer(hc.id, 'align', 'center')} className={`p-1.5 rounded ${hc.align === 'center' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><AlignCenter size={18} /></button>
                              <button onClick={() => updateHeaderContainer(hc.id, 'align', 'flex-end')} className={`p-1.5 rounded ${hc.align === 'flex-end' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><AlignRight size={18} /></button>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 uppercase flex items-center">Container Vis <InfoTooltip text="Formula to control whether this entire block is visible. E.g. =if([$Status]=='Active','flex','none'). Keep default as 'flex' or 'none' in your formula." /></label>
                            <input type="text" value={hc.containerVis} onChange={(e) => updateHeaderContainer(hc.id, 'containerVis', e.target.value)} placeholder="Hide whole block" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {headerContainers.length === 0 && <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-300 rounded-lg"><p className="text-slate-500 text-sm">No header containers. Add one above.</p></div>}

                  <div className="mt-6 pt-5 border-t border-slate-200">
                    <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Static Preview</h3>
                    <div className="flex flex-col w-full">
                      {headerContainers.map(hc => (
                        <div key={`preview-${hc.id}`} className="px-6 py-5 rounded-md flex items-center shadow-sm mb-3" style={{ backgroundColor: hc.bgColor, color: hc.textColor, justifyContent: hc.align }}>
                          {hc.showIcon && <div className="mr-4 flex items-center justify-center">{renderPreviewIcon(hc.icon)}</div>}
                          <div className={`${mapSPFontToTailwind(hc.textSize)} font-semibold break-words`}>
                            {parseSPExpression(hc.title)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BODY TAB */}
              {activeTab === 'body' && (
                <div className="space-y-5">
                  <div className="border-b pb-3 flex justify-between items-end">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">Body Layout (Sections)</h2>
                    </div>
                    <button onClick={addBodySection} className="flex items-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md font-medium transition-colors border border-blue-200">
                      <Plus size={16} /> Add Section
                    </button>
                  </div>
                  <div className="space-y-4">
                    {bodySections.map((sec, index) => (
                      <div key={sec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative group">
                        <button onClick={() => removeBodySection(sec.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                        <div className="mb-3">
                          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Section {index + 1} Name</label>
                          <input type="text" value={sec.title} onChange={(e) => updateBodySection(sec.id, 'title', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Columns (Comma separated)</label>
                          <input type="text" value={sec.fields} onChange={(e) => updateBodySection(sec.id, 'fields', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISIBILITY TAB */}
              {activeTab === 'visibility' && (
                <div className="space-y-5">
                  <div className="border-b pb-3">
                    <h2 className="text-lg font-semibold text-slate-800">Field Visibility Formula</h2>
                    <p className="text-sm text-slate-500 mt-1">Configure modern conditional formulas for columns.</p>
                  </div>
                  <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Internal Field Name</label>
                        <input type="text" value={visField} onChange={(e) => setVisField(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Field Type</label>
                        <select value={visFieldType} onChange={handleFieldTypeChange} className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono">
                          <option value="text">Text / Number</option>
                          <option value="choice">Choice</option>
                          <option value="boolean">Yes / No (Boolean)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Operator</label>
                        <select value={visCondition} onChange={(e) => setVisCondition(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono">
                          <option value="==">== (Eq)</option>
                          <option value="!=">!= (Not Eq)</option>
                          {visFieldType !== 'boolean' && (<><option value=">">&gt; (Greater)</option><option value="<">&lt; (Less)</option></>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Value</label>
                        {visFieldType === 'boolean' ? (
                          <select value={visValue} onChange={(e) => setVisValue(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono"><option value="true">Yes</option><option value="false">No</option></select>
                        ) : (
                          <input type="text" value={visValue} onChange={(e) => setVisValue(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER TAB */}
              {activeTab === 'footer' && (
                <div className="space-y-6">
                  <div className="border-b pb-3 flex justify-between items-end">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">Footer Layout</h2>
                      <p className="text-sm text-slate-500 mt-1">Configure bottom section containers.</p>
                    </div>
                    <button onClick={addFooterContainer} className="flex items-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md font-medium transition-colors border border-blue-200">
                      <Plus size={16} /> Add Container
                    </button>
                  </div>

                  {footerContainers.map((fc, index) => (
                    <div key={fc.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 relative group">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="font-semibold text-slate-600 uppercase text-xs tracking-wider">Footer Block {index + 1}</span>
                        <button onClick={() => removeFooterContainer(fc.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-slate-700 flex items-center gap-2"><Settings2 size={16} /> Footer Text</h3></div>
                        <div>
                          <input type="text" value={fc.text} onChange={(e) => updateFooterContainer(fc.id, 'text', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-sm" />
                          <VariableChips onInsert={(v) => insertVariableIntoArray(setFooterContainers, fc.id, 'text', v)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Font Size</label>
                            <select value={fc.textSize} onChange={(e) => updateFooterContainer(fc.id, 'textSize', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                              {fontSizes.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 uppercase flex items-center">Visibility <InfoTooltip text="Formula to toggle this text string. E.g. =if([$Status],'inline','none')" /></label>
                            <input type="text" value={fc.textVis} onChange={(e) => updateFooterContainer(fc.id, 'textVis', e.target.value)} placeholder="e.g. =if([$Status],'inline','none')" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono" />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Settings2 size={16} /> Footer Links</h3>
                          <button onClick={() => addFooterLink(fc.id)} className="flex items-center gap-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md font-medium transition-colors border border-blue-300">
                            <Plus size={14} /> Add Link
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {fc.links.map((link) => (
                            <div key={link.id} className="flex gap-2 items-start bg-white p-2 rounded border border-slate-200 relative group shadow-sm">
                              <div className="flex-1">
                                <input type="text" value={link.text} onChange={(e) => updateFooterLink(fc.id, link.id, 'text', e.target.value)} placeholder="Display Text" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 mb-2" />
                                <input type="text" value={link.url} onChange={(e) => updateFooterLink(fc.id, link.id, 'url', e.target.value)} placeholder="URL or mailto:" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 font-mono" />
                              </div>
                              <button onClick={() => removeFooterLink(fc.id, link.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50"><Trash2 size={16} /></button>
                            </div>
                          ))}
                        </div>
                        
                        {fc.links.length > 0 && (
                          <div className="pt-2">
                            <label className="text-xs font-semibold text-slate-600 mb-1 uppercase flex items-center">Visibility <InfoTooltip text="Formula to hide/show ALL links in this container." /></label>
                            <input type="text" value={fc.linksVis} onChange={(e) => updateFooterContainer(fc.id, 'linksVis', e.target.value)} placeholder="Hide all links based on condition" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono" />
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-200 pt-4 space-y-4">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Settings2 size={16} /> Container Styling</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <ColorPicker label="Background Color" value={fc.bgColor} onChange={(e) => updateFooterContainer(fc.id, 'bgColor', e.target.value)} />
                          <ColorPicker label="Text Color" value={fc.textColor} onChange={(e) => updateFooterContainer(fc.id, 'textColor', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-end">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Alignment</label>
                            <div className="flex bg-slate-200 p-1 rounded-md w-fit">
                              <button onClick={() => updateFooterContainer(fc.id, 'align', 'left')} className={`p-1.5 rounded ${fc.align === 'left' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><AlignLeft size={18} /></button>
                              <button onClick={() => updateFooterContainer(fc.id, 'align', 'center')} className={`p-1.5 rounded ${fc.align === 'center' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><AlignCenter size={18} /></button>
                              <button onClick={() => updateFooterContainer(fc.id, 'align', 'right')} className={`p-1.5 rounded ${fc.align === 'right' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><AlignRight size={18} /></button>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 uppercase flex items-center">Container Vis <InfoTooltip text="Formula to hide or show this entire footer block. E.g. =if([$Status]=='Closed','block','none')." /></label>
                            <input type="text" value={fc.containerVis} onChange={(e) => updateFooterContainer(fc.id, 'containerVis', e.target.value)} placeholder="Hide whole footer" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {footerContainers.length === 0 && <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-300 rounded-lg"><p className="text-slate-500 text-sm">No footer containers. Add one above.</p></div>}

                  <div className="mt-6 pt-5 border-t border-slate-200">
                    <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Static Preview</h3>
                    <div className="flex flex-col w-full border border-slate-200 rounded-md overflow-hidden bg-white mt-2">
                      {footerContainers.map((fc, index) => (
                        <div key={`preview-${fc.id}`} className={`w-full px-6 py-5 break-words ${mapSPFontToTailwind(fc.textSize)} ${index > 0 ? 'border-t border-slate-200' : ''}`} style={{ backgroundColor: fc.bgColor, color: fc.textColor, textAlign: fc.align }}>
                          <span>{parseSPExpression(fc.text)}</span>
                          {fc.links.map((link, idx) => (
                            <React.Fragment key={link.id}>
                              { (fc.text || idx > 0) && <span className="mx-2 opacity-50">|</span> }
                              <a href={link.url} onClick={(e) => e.preventDefault()} className="no-underline font-semibold hover:underline" style={{ color: fc.textColor !== '#605e5c' ? fc.textColor : '#0078d4' }}>
                                {link.text}
                              </a>
                            </React.Fragment>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* COMMAND BAR TAB */}
              {activeTab === 'commandbar' && (
                <div className="space-y-5">
                  <div className="border-b pb-3 flex justify-between items-end">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">Command Bar</h2>
                    </div>
                    <button onClick={handleSelectAllCommands} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-medium border border-slate-300">
                      {Object.values(hiddenCommands).every(v => v) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {Object.entries(commandLabels).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded border border-transparent hover:border-slate-300 hover:shadow-sm">
                        <input type="checkbox" checked={hiddenCommands[key]} onChange={() => handleCommandToggle(key)} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Code Output Panel */}
          <div className="w-full flex flex-col mt-4">
            <div className="bg-[#1e1e1e] rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden min-h-[400px]">
              <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-[#404040]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm font-mono text-slate-300 ml-2">{activeTab === 'visibility' ? 'Formula Output' : 'JSON Payload'}</span>
                </div>
                <button onClick={copyToClipboard} className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#404040] hover:bg-[#505050] text-slate-200 text-sm font-medium border border-[#505050]">
                  {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : (activeTab === 'visibility' ? 'Copy Formula' : 'Copy Code')}
                </button>
              </div>
              <div className="p-5 flex-1 overflow-auto custom-scrollbar">
                <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap">
                  {activeTab === 'visibility' ? generateFieldVisibilityFormula() : JSON.stringify(getCurrentJSON(), null, 2)}
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e1e1e; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #404040; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #505050; }
      `}} />
    </div>
  );
};

export default App;