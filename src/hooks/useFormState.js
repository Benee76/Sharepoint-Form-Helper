import { useState, useEffect, useRef } from 'react';
import {
  DEFAULT_MASTER_FIELDS,
  DEFAULT_HIDDEN_COMMANDS,
  DEFAULT_HEADER,
  DEFAULT_BODY,
  DEFAULT_FOOTER,
  DEFAULT_VIS_CONDITIONS,
  DRAFT_STORAGE_KEY,
  PRESETS_STORAGE_KEY,
  readStorage,
  writeStorage,
  buildVisibilityFormula,
  parseMsFontClass,
  sanitizeInternalName,
  diagnoseJsonError
} from '../lib/formUtils';

export {
  DEFAULT_MASTER_FIELDS,
  DEFAULT_HIDDEN_COMMANDS
};

const emptyDraft = () => ({
  masterFields: DEFAULT_MASTER_FIELDS,
  headerContainers: DEFAULT_HEADER,
  bodySections: DEFAULT_BODY,
  footerContainers: DEFAULT_FOOTER,
  visLogicalOperator: 'AND',
  visTargetField: 'Status',
  visConditions: DEFAULT_VIS_CONDITIONS,
  hiddenCommands: DEFAULT_HIDDEN_COMMANDS,
  commandConfigs: {},
  customCommands: []
});

export const useFormState = () => {
  const draft = readStorage(DRAFT_STORAGE_KEY, null);
  const initial = draft && typeof draft === 'object' ? { ...emptyDraft(), ...draft } : emptyDraft();

  const [masterFields, setMasterFields] = useState(initial.masterFields?.length ? initial.masterFields : DEFAULT_MASTER_FIELDS);
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldLabel, setCustomFieldLabel] = useState('');
  const [customFieldType, setCustomFieldType] = useState('text');

  const [headerContainers, setHeaderContainers] = useState(initial.headerContainers?.length ? initial.headerContainers : DEFAULT_HEADER);
  const [bodySections, setBodySections] = useState(initial.bodySections?.length ? initial.bodySections : DEFAULT_BODY);
  const [footerContainers, setFooterContainers] = useState(initial.footerContainers?.length ? initial.footerContainers : DEFAULT_FOOTER);

  const [visLogicalOperator, setVisLogicalOperator] = useState(initial.visLogicalOperator || 'AND');
  const [visTargetField, setVisTargetField] = useState(initial.visTargetField || 'Status');
  const [visConditions, setVisConditions] = useState(initial.visConditions?.length ? initial.visConditions : DEFAULT_VIS_CONDITIONS);
  const [hiddenCommands, setHiddenCommands] = useState({ ...DEFAULT_HIDDEN_COMMANDS, ...initial.hiddenCommands });
  const [commandConfigs, setCommandConfigs] = useState(initial.commandConfigs || {});
  const [customCommands, setCustomCommands] = useState(initial.customCommands || []);

  const skipPersist = useRef(true);

  // Undo / Redo history stack
  const initialSnap = {
    masterFields: initial.masterFields?.length ? initial.masterFields : DEFAULT_MASTER_FIELDS,
    headerContainers: initial.headerContainers?.length ? initial.headerContainers : DEFAULT_HEADER,
    bodySections: initial.bodySections?.length ? initial.bodySections : DEFAULT_BODY,
    footerContainers: initial.footerContainers?.length ? initial.footerContainers : DEFAULT_FOOTER,
    visLogicalOperator: initial.visLogicalOperator || 'AND',
    visTargetField: initial.visTargetField || 'Status',
    visConditions: initial.visConditions?.length ? initial.visConditions : DEFAULT_VIS_CONDITIONS,
    hiddenCommands: { ...DEFAULT_HIDDEN_COMMANDS, ...initial.hiddenCommands },
    commandConfigs: initial.commandConfigs || {},
    customCommands: initial.customCommands || []
  };

  const historyRef = useRef([initialSnap]);
  const historyIndexRef = useRef(0);
  const isTimeTravelingRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const applySnapshot = (snap) => {
    if (!snap) return;
    isTimeTravelingRef.current = true;
    if (snap.masterFields) setMasterFields(snap.masterFields);
    if (snap.headerContainers) setHeaderContainers(snap.headerContainers);
    if (snap.bodySections) setBodySections(snap.bodySections);
    if (snap.footerContainers) setFooterContainers(snap.footerContainers);
    if (snap.visLogicalOperator) setVisLogicalOperator(snap.visLogicalOperator);
    if (snap.visTargetField) setVisTargetField(snap.visTargetField);
    if (snap.visConditions) setVisConditions(snap.visConditions);
    if (snap.hiddenCommands) setHiddenCommands(snap.hiddenCommands);
    if (snap.commandConfigs) setCommandConfigs(snap.commandConfigs);
    if (snap.customCommands) setCustomCommands(snap.customCommands);
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      const targetIndex = historyIndexRef.current - 1;
      historyIndexRef.current = targetIndex;
      applySnapshot(historyRef.current[targetIndex]);
      setCanUndo(targetIndex > 0);
      setCanRedo(targetIndex < historyRef.current.length - 1);
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      const targetIndex = historyIndexRef.current + 1;
      historyIndexRef.current = targetIndex;
      applySnapshot(historyRef.current[targetIndex]);
      setCanUndo(targetIndex > 0);
      setCanRedo(targetIndex < historyRef.current.length - 1);
    }
  };

  useEffect(() => {
    const currentSnap = {
      masterFields,
      headerContainers,
      bodySections,
      footerContainers,
      visLogicalOperator,
      visTargetField,
      visConditions,
      hiddenCommands,
      commandConfigs,
      customCommands
    };

    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }

    if (isTimeTravelingRef.current) {
      isTimeTravelingRef.current = false;
      writeStorage(DRAFT_STORAGE_KEY, currentSnap);
      return;
    }

    const snapString = JSON.stringify(currentSnap);
    const lastSnapString = historyRef.current[historyIndexRef.current]
      ? JSON.stringify(historyRef.current[historyIndexRef.current])
      : null;

    if (snapString !== lastSnapString) {
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(currentSnap);
      if (newHistory.length > 50) newHistory.shift();
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(false);
    }

    writeStorage(DRAFT_STORAGE_KEY, currentSnap);
  }, [
    masterFields,
    headerContainers,
    bodySections,
    footerContainers,
    visLogicalOperator,
    visTargetField,
    visConditions,
    hiddenCommands,
    commandConfigs,
    customCommands
  ]);

  const addCustomField = () => {
    const nameTrimmed = customFieldName.trim();
    const labelTrimmed = customFieldLabel.trim() || nameTrimmed;
    if (!nameTrimmed) return { success: false, error: 'Internal name is required.' };
    if (masterFields.some((f) => f.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      return { success: false, error: 'A field with that internal name already exists.' };
    }

    setMasterFields((prev) => {
      if (prev.some((f) => f.name.toLowerCase() === nameTrimmed.toLowerCase())) return prev;
      return [...prev, { name: nameTrimmed, label: labelTrimmed, type: customFieldType }];
    });
    setCustomFieldName('');
    setCustomFieldLabel('');
    return { success: true };
  };

  const removeCustomField = (fieldName) => {
    setMasterFields((prev) => prev.filter((f) => f.name !== fieldName));
    setBodySections((prev) => prev.map((sec) => ({
      ...sec,
      fields: sec.fields.filter((f) => f !== fieldName)
    })));
  };

  const bulkImportFields = (rawText) => {
    const mergeFields = (incoming) => {
      let added = 0;
      setMasterFields((prev) => {
        const existingNames = new Set(prev.map((mf) => mf.name.toLowerCase()));
        const newFields = [];
        incoming.forEach((f) => {
          const key = f.name.toLowerCase();
          if (!existingNames.has(key)) {
            existingNames.add(key);
            newFields.push(f);
          }
        });
        added = newFields.length;
        return newFields.length ? [...prev, ...newFields] : prev;
      });
      return added;
    };

    try {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map((f) => {
          const rawName = String(f.name || f.Name || '').trim();
          const cleanName = sanitizeInternalName(rawName);
          const label = String(f.label || f.DisplayName || rawName || '').trim();
          return {
            name: cleanName,
            label: label || cleanName,
            type: String(f.type || f.Type || 'text').toLowerCase()
          };
        }).filter((f) => f.name);

        if (cleaned.length === 0) return { success: false, error: 'No valid fields found in JSON.' };
        const added = mergeFields(cleaned);
        if (added === 0) return { success: false, error: 'All listed fields already exist.' };
        return { success: true, count: added };
      }
    } catch {
      const lines = rawText.split(/[\n,]+/).map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return { success: false, error: 'Empty input text.' };

      const cleaned = lines.map((line) => {
        const cleanName = sanitizeInternalName(line);
        return {
          name: cleanName,
          label: line,
          type: 'text'
        };
      }).filter((f) => f.name);

      if (cleaned.length === 0) return { success: false, error: 'No valid field names found.' };
      const added = mergeFields(cleaned);
      if (added === 0) return { success: false, error: 'All listed fields already exist.' };
      return { success: true, count: added };
    }
    return { success: false, error: 'JSON must be an array of fields.' };
  };

  const addHeaderContainer = () => setHeaderContainers((prev) => [
    ...prev,
    {
      id: Date.now(),
      title: 'New Header Block',
      textSize: 'ms-font-xl',
      titleVis: '',
      showIcon: false,
      icon: 'Info',
      iconVis: '',
      bgColor: '#f3f2f1',
      textColor: '#323130',
      containerVis: '',
      align: 'flex-start'
    }
  ]);
  const updateHeaderContainer = (id, key, value) => setHeaderContainers((prev) => prev.map((hc) => (hc.id === id ? { ...hc, [key]: value } : hc)));
  const removeHeaderContainer = (id) => setHeaderContainers((prev) => prev.filter((hc) => hc.id !== id));

  const addBodySection = () => setBodySections((prev) => [...prev, { id: Date.now(), title: 'New Section', fields: [] }]);
  const updateBodySection = (id, key, value) => setBodySections((prev) => prev.map((sec) => (sec.id === id ? { ...sec, [key]: value } : sec)));
  const removeBodySection = (id) => setBodySections((prev) => prev.filter((sec) => sec.id !== id));

  const addFieldToSection = (sectionId, fieldName) => {
    setBodySections((prev) => prev.map((sec) => {
      if (sec.id === sectionId) {
        if (sec.fields.includes(fieldName)) return sec;
        return { ...sec, fields: [...sec.fields, fieldName] };
      }
      return { ...sec, fields: sec.fields.filter((f) => f !== fieldName) };
    }));
  };

  const removeFieldFromSection = (sectionId, fieldName) => {
    setBodySections((prev) => prev.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, fields: sec.fields.filter((f) => f !== fieldName) };
      }
      return sec;
    }));
  };

  const moveFieldInSection = (sectionId, index, direction) => {
    setBodySections((prev) => prev.map((sec) => {
      if (sec.id === sectionId) {
        const newFields = [...sec.fields];
        const temp = newFields[index];
        if (direction === 'up' && index > 0) {
          newFields[index] = newFields[index - 1];
          newFields[index - 1] = temp;
        } else if (direction === 'down' && index < newFields.length - 1) {
          newFields[index] = newFields[index + 1];
          newFields[index + 1] = temp;
        }
        return { ...sec, fields: newFields };
      }
      return sec;
    }));
  };

  const moveFieldToSection = (currentSectionId, targetSectionId, fieldName) => {
    setBodySections((prev) => prev.map((sec) => {
      if (sec.id === currentSectionId) {
        return { ...sec, fields: sec.fields.filter((f) => f !== fieldName) };
      }
      if (sec.id === targetSectionId) {
        if (sec.fields.includes(fieldName)) return sec;
        return { ...sec, fields: [...sec.fields, fieldName] };
      }
      return sec;
    }));
  };

  const reorderBodySections = (sourceIndex, targetIndex) => {
    setBodySections((prev) => {
      if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0 || sourceIndex >= prev.length || targetIndex >= prev.length) {
        return prev;
      }
      const copy = [...prev];
      const [moved] = copy.splice(sourceIndex, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  };

  const reorderFieldsAcrossSections = (sourceSectionId, sourceIndex, targetSectionId, targetIndex) => {
    setBodySections((prev) => {
      const sourceSec = prev.find((s) => s.id === sourceSectionId);
      if (!sourceSec) return prev;
      const fieldName = sourceSec.fields[sourceIndex];
      if (!fieldName) return prev;

      return prev.map((sec) => {
        if (sec.id === sourceSectionId && sec.id === targetSectionId) {
          const fieldsCopy = [...sec.fields];
          const [moved] = fieldsCopy.splice(sourceIndex, 1);
          const safeTargetIndex = Math.max(0, Math.min(targetIndex, fieldsCopy.length));
          fieldsCopy.splice(safeTargetIndex, 0, moved);
          return { ...sec, fields: fieldsCopy };
        }
        if (sec.id === sourceSectionId) {
          return { ...sec, fields: sec.fields.filter((_, idx) => idx !== sourceIndex) };
        }
        if (sec.id === targetSectionId) {
          const fieldsCopy = sec.fields.filter((f) => f !== fieldName);
          const safeTargetIndex = Math.max(0, Math.min(targetIndex, fieldsCopy.length));
          fieldsCopy.splice(safeTargetIndex, 0, fieldName);
          return { ...sec, fields: fieldsCopy };
        }
        return sec;
      });
    });
  };

  const addFooterContainer = () => setFooterContainers((prev) => [
    ...prev,
    {
      id: Date.now(),
      text: 'New Footer Info',
      textSize: 'ms-font-m',
      textVis: '',
      links: [],
      linksVis: '',
      bgColor: '#f3f2f1',
      textColor: '#323130',
      containerVis: '',
      align: 'left'
    }
  ]);
  const updateFooterContainer = (id, key, value) => setFooterContainers((prev) => prev.map((fc) => (fc.id === id ? { ...fc, [key]: value } : fc)));
  const removeFooterContainer = (id) => setFooterContainers((prev) => prev.filter((fc) => fc.id !== id));

  const addFooterLink = (containerId) => {
    setFooterContainers((prev) => prev.map((fc) => (fc.id === containerId ? { ...fc, links: [...(fc.links || []), { id: Date.now(), text: 'New Link', url: 'https://' }] } : fc)));
  };
  const updateFooterLink = (containerId, linkId, key, value) => {
    setFooterContainers((prev) => prev.map((fc) => (fc.id === containerId ? { ...fc, links: fc.links.map((link) => (link.id === linkId ? { ...link, [key]: value } : link)) } : fc)));
  };
  const removeFooterLink = (containerId, linkId) => {
    setFooterContainers((prev) => prev.map((fc) => (fc.id === containerId ? { ...fc, links: fc.links.filter((link) => link.id !== linkId) } : fc)));
  };

  const addVisibilityCondition = () => {
    setVisConditions((prev) => [...prev, { id: Date.now(), field: 'Status', type: 'choice', condition: '==', value: 'Completed' }]);
  };
  const updateVisibilityCondition = (id, key, value) => {
    setVisConditions((prev) => prev.map((cond) => {
      if (cond.id === id) {
        const updated = { ...cond, [key]: value };
        if (key === 'field') {
          const master = masterFields.find((f) => f.name === value);
          updated.type = master ? master.type : 'text';
          if (updated.type === 'boolean') {
            updated.value = 'true';
            if (updated.condition === '>' || updated.condition === '<' || updated.condition === '>=' || updated.condition === '<=') {
              updated.condition = '==';
            }
          }
        }
        return updated;
      }
      return cond;
    }));
  };
  const removeVisibilityCondition = (id) => {
    setVisConditions((prev) => (prev.length > 1 ? prev.filter((cond) => cond.id !== id) : prev));
  };

  const handleCommandToggle = (cmd) => {
    setHiddenCommands((prev) => {
      const nextHidden = !prev[cmd];
      setCommandConfigs((cPrev) => {
        if (!cPrev[cmd]) return cPrev;
        return {
          ...cPrev,
          [cmd]: {
            ...cPrev[cmd],
            hide: nextHidden
          }
        };
      });
      return { ...prev, [cmd]: nextHidden };
    });
  };
  
  const handleSelectAllCommands = () => {
    setHiddenCommands((prev) => {
      const isAllSelected = Object.values(prev).every(Boolean);
      return Object.keys(prev).reduce((acc, key) => {
        acc[key] = !isAllSelected;
        return acc;
      }, {});
    });
  };

  const handleCategoryCommandsToggle = (commandKeys, hide) => {
    setHiddenCommands((prev) => {
      const updated = { ...prev };
      const shouldHide = hide !== undefined ? hide : !commandKeys.every((k) => prev[k]);
      commandKeys.forEach((k) => {
        updated[k] = shouldHide;
      });
      return updated;
    });
  };

  const applyCommandBarPreset = (presetKey) => {
    const specialToolKeys = [
      'automate', 'automateCreateRule', 'automateManageRules', 'integrate',
      'powerAutomate', 'powerAutomateCreateFlow', 'powerAutomateSeeFlows', 'powerAutomateConfigureFlows',
      'powerApps', 'powerAppsCreateApp', 'powerAppsSeeAllApps', 'powerAppsCustomizeForms',
      'rules', 'rulesCommand', 'workflowsCommand', 'quickStepsCommand', 'approvalsCommand',
      'aiBuilder', 'aiBuilderCreate', 'aiBuilderGoto', 'alertMe', 'manageAlert',
      'createCopilot', 'copilotCreate', 'Copilot',
      'export', 'exportExcel', 'exportCSV', 'powerBI', 'powerBIVisualizeList', 'sync', 'syncCommand'
    ];

    if (presetKey === 'full') {
      setHiddenCommands((prev) => {
        const reset = { ...prev };
        Object.keys(reset).forEach((k) => { reset[k] = false; });
        return reset;
      });
      setCommandConfigs({});
    } else if (presetKey === 'no-tools') {
      setHiddenCommands((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => { next[k] = false; });
        specialToolKeys.forEach((k) => {
          if (next[k] !== undefined) next[k] = true;
        });
        return next;
      });
      setCommandConfigs({});
    } else if (presetKey === 'add-only-no-delete') {
      const keysToHide = [
        'delete', 'editInGridView', 'moveTo', 'emptyRecycleBin',
        ...specialToolKeys
      ];
      setHiddenCommands((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => { next[k] = false; });
        keysToHide.forEach((k) => {
          if (next[k] !== undefined) next[k] = true;
        });
        return next;
      });
      setCommandConfigs({});
    }
  };

  const updateCommandConfig = (key, prop, value) => {
    setCommandConfigs((prev) => {
      const current = prev[key] || {};
      const updated = { ...current, [prop]: value };

      if (prop === 'hide') {
        setHiddenCommands((hPrev) => ({
          ...hPrev,
          [key]: value === true || value === 'true'
        }));
      }

      const clean = {};
      Object.entries(updated).forEach(([p, v]) => {
        if (v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)) {
          clean[p] = v;
        }
      });

      if (Object.keys(clean).length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }

      return { ...prev, [key]: clean };
    });
  };

  const resetCommandConfig = (key) => {
    setCommandConfigs((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const addCustomCommand = (key, label) => {
    const cleanKey = key.trim();
    if (!cleanKey) return { success: false, error: 'Command key is required.' };
    const cleanLabel = label.trim() || cleanKey;
    if (customCommands.some((c) => c.key === cleanKey) || DEFAULT_HIDDEN_COMMANDS[cleanKey] !== undefined) {
      return { success: false, error: 'This command key already exists.' };
    }
    setCustomCommands((prev) => [...prev, { key: cleanKey, label: cleanLabel, category: 'custom' }]);
    setHiddenCommands((prev) => ({ ...prev, [cleanKey]: false }));
    return { success: true };
  };

  const removeCustomCommand = (key) => {
    setCustomCommands((prev) => prev.filter((c) => c.key !== key));
    setCommandConfigs((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    setHiddenCommands((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const applyThemeColors = (primary, text = '#ffffff', footerBg = '#f3f2f1', footerText) => {
    setHeaderContainers((prev) => prev.map((hc) => ({
      ...hc,
      bgColor: primary,
      textColor: text
    })));
    setFooterContainers((prev) => prev.map((fc) => ({
      ...fc,
      bgColor: footerBg,
      textColor: footerText || primary
    })));
  };

  const resetForm = () => {
    const defaults = emptyDraft();
    setMasterFields(defaults.masterFields);
    setHeaderContainers(defaults.headerContainers);
    setBodySections(defaults.bodySections);
    setFooterContainers(defaults.footerContainers);
    setVisLogicalOperator(defaults.visLogicalOperator);
    setVisTargetField(defaults.visTargetField);
    setVisConditions(defaults.visConditions);
    setHiddenCommands(defaults.hiddenCommands);
    setCommandConfigs({});
    setCustomCommands([]);
    setCustomFieldName('');
    setCustomFieldLabel('');
    setCustomFieldType('text');
    writeStorage(DRAFT_STORAGE_KEY, defaults);
  };

  const generateHeaderJSON = () => {
    if (headerContainers.length === 0) return {};

    const children = headerContainers.map((hc) => {
      const innerChildren = [];
      if (hc.showIcon) {
        innerChildren.push({
          elmType: 'span',
          attributes: { iconName: hc.icon, class: 'ms-font-xl' },
          style: { 'margin-right': '16px', display: hc.iconVis || 'block' }
        });
      }
      if (hc.title) {
        innerChildren.push({
          elmType: 'div',
          attributes: { class: `${hc.textSize} ms-fontWeight-semibold` },
          style: { display: hc.titleVis || 'block' },
          txtContent: hc.title
        });
      }
      return {
        elmType: 'div',
        attributes: { class: 'ms-padding-20' },
        style: {
          padding: '20px 24px',
          'background-color': hc.bgColor,
          color: hc.textColor,
          display: hc.containerVis || 'flex',
          'align-items': 'center',
          'justify-content': hc.align,
          'border-radius': '4px',
          'margin-bottom': '10px'
        },
        children: innerChildren
      };
    });

    if (children.length === 1) return children[0];
    return { elmType: 'div', style: { display: 'flex', 'flex-direction': 'column', width: '100%' }, children };
  };

  const generateBodyJSON = () => ({
    sections: bodySections.map((sec) => ({
      displayname: sec.title,
      fields: sec.fields
    }))
  });

  const generateFooterJSON = () => {
    if (footerContainers.length === 0) return {};

    const children = footerContainers.map((fc) => {
      const innerChildren = [];
      if (fc.text) {
        innerChildren.push({
          elmType: 'span',
          attributes: { class: fc.textSize },
          style: { display: fc.textVis || 'inline' },
          txtContent: fc.text
        });
      }
      if ((fc.links || []).length > 0) {
        const linkChildren = fc.links.map((link, idx) => ({
          elmType: 'a',
          txtContent: link.text,
          attributes: { target: '_blank', href: link.url },
          style: {
            color: fc.textColor !== '#605e5c' ? fc.textColor : '#0078d4',
            'text-decoration': 'none',
            'font-weight': '600',
            'margin-left': idx === 0 && !fc.text ? '0px' : '6px',
            'margin-right': '6px',
            'font-size': 'inherit'
          }
        }));
        innerChildren.push({
          elmType: 'span',
          attributes: { class: fc.textSize },
          style: { display: fc.linksVis || 'inline' },
          children: linkChildren
        });
      }
      return {
        elmType: 'div',
        style: {
          width: '100%',
          'text-align': fc.align,
          padding: '20px 24px',
          'background-color': fc.bgColor,
          color: fc.textColor,
          display: fc.containerVis || 'block'
        },
        children: innerChildren
      };
    });

    if (children.length === 1) {
      children[0].style['border-top'] = '1px solid #eaeaea';
      children[0].style['margin-top'] = '20px';
      return children[0];
    }

    return {
      elmType: 'div',
      style: {
        width: '100%',
        'border-top': '1px solid #eaeaea',
        'margin-top': '20px',
        display: 'flex',
        'flex-direction': 'column',
        overflow: 'hidden'
      },
      children
    };
  };

  const generateFieldVisibilityFormula = () => buildVisibilityFormula(visConditions, visLogicalOperator);

  const generateCommandBarJSON = () => {
    const allKeys = new Set([
      ...Object.keys(hiddenCommands).filter((key) => hiddenCommands[key]),
      ...Object.keys(commandConfigs)
    ]);

    const commands = [];
    allKeys.forEach((key) => {
      const cfg = commandConfigs[key] || {};
      const isHidden = hiddenCommands[key];

      const cmdObj = { key };

      if (cfg.hide !== undefined && cfg.hide !== '') {
        cmdObj.hide = (cfg.hide === 'true' || cfg.hide === true) ? true : ((cfg.hide === 'false' || cfg.hide === false) ? false : cfg.hide);
      } else if (isHidden) {
        cmdObj.hide = true;
      }

      if (cfg.text && typeof cfg.text === 'string' && cfg.text.trim()) {
        cmdObj.text = cfg.text.trim();
      }
      if (cfg.title && typeof cfg.title === 'string' && cfg.title.trim()) {
        cmdObj.title = cfg.title.trim();
      }
      if (cfg.iconName !== undefined && cfg.iconName !== '') {
        cmdObj.iconName = cfg.iconName;
      }
      if (cfg.primary === true) {
        cmdObj.primary = true;
      }
      if (cfg.position !== undefined && cfg.position !== '' && !isNaN(Number(cfg.position))) {
        cmdObj.position = Number(cfg.position);
      }
      if (cfg.sectionType === 'Primary' || cfg.sectionType === 'Overflow') {
        cmdObj.sectionType = cfg.sectionType;
      }
      if (Array.isArray(cfg.selectionModes) && cfg.selectionModes.length > 0) {
        cmdObj.selectionModes = cfg.selectionModes;
      }

      if (Object.keys(cmdObj).length > 1) {
        commands.push(cmdObj);
      }
    });

    return { commandBarProps: { commands } };
  };

  const generateFullBundleJSON = () => ({
    $schema: 'https://sharepoint-form-helper/schema.json',
    version: '1.0',
    masterFields,
    header: generateHeaderJSON(),
    body: generateBodyJSON(),
    footer: generateFooterJSON(),
    commandBar: generateCommandBarJSON(),
    visibility: {
      targetField: visTargetField,
      logicalOperator: visLogicalOperator,
      conditions: visConditions,
      formula: generateFieldVisibilityFormula()
    }
  });

  const importJSON = (jsonString, type) => {
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (syntaxErr) {
      return diagnoseJsonError(jsonString, syntaxErr);
    }

    try {
      if (!parsed || typeof parsed !== 'object') {
        return { 
          success: false, 
          error: 'Invalid JSON Object: Root must be a valid JSON object or array.',
          hint: 'Ensure your JSON payload starts with "{" or "["'
        };
      }

      if (type === 'bundle' || parsed.$schema || (parsed.header && parsed.body && parsed.footer)) {
        if (parsed.header) importJSON(JSON.stringify(parsed.header), 'header');
        if (parsed.body) importJSON(JSON.stringify(parsed.body), 'body');
        if (parsed.footer) importJSON(JSON.stringify(parsed.footer), 'footer');
        if (parsed.commandBar) importJSON(JSON.stringify(parsed.commandBar), 'commandbar');
        if (parsed.masterFields?.length) setMasterFields(parsed.masterFields);
        if (parsed.visibility) {
          if (parsed.visibility.targetField) setVisTargetField(parsed.visibility.targetField);
          if (parsed.visibility.logicalOperator) setVisLogicalOperator(parsed.visibility.logicalOperator);
          if (parsed.visibility.conditions?.length) setVisConditions(parsed.visibility.conditions);
        }
        return { success: true };
      }

      if (type === 'header') {
        const containers = [];
        const parseBlock = (block, id) => {
          const style = block.style || {};
          const isIcon = block.children?.find((c) => c.elmType === 'span' && c.attributes?.iconName);
          const iconObj = isIcon ? isIcon.attributes.iconName : 'Info';
          const iconVisObj = isIcon ? (isIcon.style?.display || '') : '';

          const isTitle = block.children?.find((c) => c.elmType === 'div');
          const titleText = isTitle ? (isTitle.txtContent || '') : (block.txtContent || '');
          const titleSize = parseMsFontClass(isTitle ? isTitle.attributes?.class : '', 'ms-font-xl');
          const titleVisObj = isTitle ? (isTitle.style?.display || '') : '';

          containers.push({
            id,
            title: titleText,
            textSize: titleSize,
            titleVis: titleVisObj,
            showIcon: !!isIcon,
            icon: iconObj,
            iconVis: iconVisObj,
            bgColor: style['background-color'] || '#0078d4',
            textColor: style.color || '#ffffff',
            containerVis: style.display || '',
            align: style['justify-content'] || 'flex-start'
          });
        };

        if (parsed.children && parsed.elmType === 'div' && parsed.style?.['flex-direction'] === 'column') {
          parsed.children.forEach((child, idx) => parseBlock(child, Date.now() + idx));
        } else {
          parseBlock(parsed, Date.now());
        }
        setHeaderContainers(containers);
        return { success: true };
      }

      if (type === 'body') {
        if (!parsed.sections || !Array.isArray(parsed.sections)) {
          throw new Error("Invalid Body JSON: must contain a 'sections' array.");
        }
        const seenFields = new Set();
        const sections = parsed.sections.map((sec, idx) => ({
          id: Date.now() + idx,
          title: sec.displayname || `Section ${idx + 1}`,
          fields: (Array.isArray(sec.fields) ? sec.fields : []).filter((f) => {
            if (!f || seenFields.has(f)) return false;
            seenFields.add(f);
            return true;
          })
        }));

        setMasterFields((prev) => {
          const names = new Set(prev.map((mf) => mf.name.toLowerCase()));
          const fieldsToAdd = [];
          sections.forEach((sec) => {
            sec.fields.forEach((f) => {
              if (!names.has(String(f).toLowerCase())) {
                names.add(String(f).toLowerCase());
                fieldsToAdd.push({ name: f, label: f, type: 'text' });
              }
            });
          });
          return fieldsToAdd.length ? [...prev, ...fieldsToAdd] : prev;
        });

        setBodySections(sections);
        return { success: true };
      }

      if (type === 'footer') {
        const containers = [];
        const parseBlock = (block, id) => {
          const style = block.style || {};

          const isText = block.children?.find((c) => c.elmType === 'span' && c.txtContent);
          const txtVal = isText ? (isText.txtContent || '') : (block.txtContent || '');
          const txtSize = parseMsFontClass(isText ? isText.attributes?.class : '', 'ms-font-m');
          const textVisObj = isText ? (isText.style?.display || '') : '';

          const isLinks = block.children?.find((c) => c.elmType === 'span' && c.children?.length > 0);
          const linksVisObj = isLinks ? (isLinks.style?.display || '') : '';
          const linksArray = isLinks ? isLinks.children.map((lnk, idx) => ({
            id: Date.now() + idx,
            text: lnk.txtContent || 'Link',
            url: lnk.attributes?.href || '#'
          })) : [];

          containers.push({
            id,
            text: txtVal,
            textSize: txtSize,
            textVis: textVisObj,
            links: linksArray,
            linksVis: linksVisObj,
            bgColor: style['background-color'] || '#ffffff',
            textColor: style.color || '#605e5c',
            containerVis: style.display || '',
            align: style['text-align'] || 'left'
          });
        };

        if (parsed.children && parsed.elmType === 'div' && parsed.style?.['flex-direction'] === 'column') {
          parsed.children.forEach((child, idx) => parseBlock(child, Date.now() + idx));
        } else {
          parseBlock(parsed, Date.now());
        }
        setFooterContainers(containers);
        return { success: true };
      }

      if (type === 'commandbar') {
        const commands = parsed.commandBarProps?.commands || [];
        const hidden = { ...DEFAULT_HIDDEN_COMMANDS };
        const newConfigs = {};
        const newCustomCommands = [...customCommands];

        commands.forEach((cmd) => {
          if (!cmd.key) return;
          const key = cmd.key;

          if (!COMMAND_LABELS[key] && !newCustomCommands.some((c) => c.key === key)) {
            newCustomCommands.push({ key, label: cmd.text || key, category: 'custom' });
          }

          const cfg = {};
          if (cmd.hide !== undefined) {
            cfg.hide = cmd.hide;
            if (cmd.hide === true || cmd.hide === 'true') {
              hidden[key] = true;
            } else {
              hidden[key] = false;
            }
          }
          if (cmd.text !== undefined && cmd.text !== '') cfg.text = cmd.text;
          if (cmd.title !== undefined && cmd.title !== '') cfg.title = cmd.title;
          if (cmd.iconName !== undefined) cfg.iconName = cmd.iconName;
          if (cmd.primary !== undefined) cfg.primary = !!cmd.primary;
          if (cmd.position !== undefined && cmd.position !== '') cfg.position = cmd.position;
          if (cmd.sectionType !== undefined && cmd.sectionType !== '') cfg.sectionType = cmd.sectionType;
          if (Array.isArray(cmd.selectionModes) && cmd.selectionModes.length > 0) cfg.selectionModes = cmd.selectionModes;

          if (Object.keys(cfg).length > 0) {
            newConfigs[key] = cfg;
          }
        });

        setHiddenCommands(hidden);
        setCommandConfigs(newConfigs);
        setCustomCommands(newCustomCommands);
        return { success: true };
      }

      throw new Error(`Unsupported import type: ${type}`);
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const presets = {
    helpdesk: {
      header: [
        {
          id: 1,
          title: "='Support Ticket: ' + [$Title] + ' (' + [$Priority] + ')'",
          textSize: 'ms-font-xl',
          titleVis: '',
          showIcon: true,
          icon: 'DietPlanNotebook',
          iconVis: '',
          bgColor: '#005a9e',
          textColor: '#ffffff',
          containerVis: '',
          align: 'flex-start'
        }
      ],
      body: [
        { id: 1, title: 'Ticket Information', fields: ['Title', 'Priority', 'Status'] },
        { id: 2, title: 'Issue Details', fields: ['Description', 'AssignedTo'] },
        { id: 3, title: 'Dates & Times', fields: ['Created', 'Modified'] }
      ],
      footer: [
        {
          id: 1,
          text: "='Created on ' + [$Created] + ' by ' + [$Author.title]",
          textSize: 'ms-font-m',
          textVis: '',
          links: [{ id: 1, text: 'Submit Escalation', url: 'https://escalations.company.com' }],
          linksVis: '',
          bgColor: '#f3f2f1',
          textColor: '#323130',
          containerVis: '',
          align: 'center'
        }
      ]
    },
    tracker: {
      header: [
        {
          id: 1,
          title: "='Project Phase: ' + [$Title]",
          textSize: 'ms-font-xl',
          titleVis: '',
          showIcon: true,
          icon: 'TimelineProgress',
          iconVis: '',
          bgColor: '#d83b01',
          textColor: '#ffffff',
          containerVis: '',
          align: 'flex-start'
        }
      ],
      body: [
        { id: 1, title: 'Project Overview', fields: ['Title', 'Status'] },
        { id: 2, title: 'Timeline & Deadline', fields: ['StartDate', 'DueDate', 'AssignedTo'] },
        { id: 3, title: 'System Audits', fields: ['Editor'] }
      ],
      footer: [
        {
          id: 1,
          text: "='Last modified by ' + [$Editor.title] + ' on ' + [$Modified]",
          textSize: 'ms-font-m',
          textVis: '',
          links: [{ id: 1, text: 'Project Hub', url: 'https://teams.company.com' }],
          linksVis: '',
          bgColor: '#faf9f8',
          textColor: '#605e5c',
          containerVis: '',
          align: 'left'
        }
      ]
    }
  };

  const loadPreset = (presetKey) => {
    const data = presets[presetKey];
    if (!data) return;
    if (data.header) setHeaderContainers(data.header);
    if (data.body) setBodySections(data.body);
    if (data.footer) setFooterContainers(data.footer);
  };

  const saveCustomPreset = (name) => {
    if (!name.trim()) return { success: false, error: 'Name is required.' };
    const config = {
      header: headerContainers,
      body: bodySections,
      footer: footerContainers,
      visibility: { visLogicalOperator, visTargetField, visConditions },
      commands: hiddenCommands,
      masterFields
    };
    const saved = readStorage(PRESETS_STORAGE_KEY, {});
    saved[name.trim()] = config;
    writeStorage(PRESETS_STORAGE_KEY, saved);
    return { success: true };
  };

  const getCustomPresetsList = () => Object.keys(readStorage(PRESETS_STORAGE_KEY, {}));

  const loadCustomPreset = (name) => {
    const saved = readStorage(PRESETS_STORAGE_KEY, {});
    const data = saved[name];
    if (!data) return;
    if (data.header) setHeaderContainers(data.header);
    if (data.body) setBodySections(data.body);
    if (data.footer) setFooterContainers(data.footer);
    if (data.masterFields?.length) setMasterFields(data.masterFields);
    if (data.visibility) {
      setVisLogicalOperator(data.visibility.visLogicalOperator || 'AND');
      setVisTargetField(data.visibility.visTargetField || 'Status');
      setVisConditions(data.visibility.visConditions?.length ? data.visibility.visConditions : DEFAULT_VIS_CONDITIONS);
    }
    if (data.commands) setHiddenCommands({ ...DEFAULT_HIDDEN_COMMANDS, ...data.commands });
  };

  const deleteCustomPreset = (name) => {
    const saved = readStorage(PRESETS_STORAGE_KEY, {});
    delete saved[name];
    writeStorage(PRESETS_STORAGE_KEY, saved);
  };

  return {
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
    headerContainers,
    addHeaderContainer,
    updateHeaderContainer,
    removeHeaderContainer,
    bodySections,
    addBodySection,
    updateBodySection,
    removeBodySection,
    addFieldToSection,
    removeFieldFromSection,
    moveFieldInSection,
    moveFieldToSection,
    reorderBodySections,
    reorderFieldsAcrossSections,
    footerContainers,
    addFooterContainer,
    updateFooterContainer,
    removeFooterContainer,
    addFooterLink,
    updateFooterLink,
    removeFooterLink,
    visLogicalOperator,
    setVisLogicalOperator,
    visTargetField,
    setVisTargetField,
    visConditions,
    addVisibilityCondition,
    updateVisibilityCondition,
    removeVisibilityCondition,
    hiddenCommands,
    handleCommandToggle,
    handleSelectAllCommands,
    handleCategoryCommandsToggle,
    applyCommandBarPreset,
    commandConfigs,
    updateCommandConfig,
    resetCommandConfig,
    customCommands,
    addCustomCommand,
    removeCustomCommand,
    applyThemeColors,
    resetForm,
    generateHeaderJSON,
    generateBodyJSON,
    generateFooterJSON,
    generateFieldVisibilityFormula,
    generateCommandBarJSON,
    generateFullBundleJSON,
    importJSON,
    loadPreset,
    saveCustomPreset,
    loadCustomPreset,
    deleteCustomPreset,
    getCustomPresetsList,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
