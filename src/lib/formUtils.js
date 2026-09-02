export const DEFAULT_MASTER_FIELDS = [
  { name: 'Title', label: 'Title', type: 'text' },
  { name: 'Status', label: 'Status', type: 'choice' },
  { name: 'Priority', label: 'Priority', type: 'choice' },
  { name: 'AssignedTo', label: 'Assigned To', type: 'user' },
  { name: 'Description', label: 'Description', type: 'note' },
  { name: 'StartDate', label: 'Start Date', type: 'date' },
  { name: 'DueDate', label: 'Due Date', type: 'date' },
  { name: 'Created', label: 'Created', type: 'date' },
  { name: 'Modified', label: 'Modified', type: 'date' },
  { name: 'Author', label: 'Created By', type: 'user' },
  { name: 'Editor', label: 'Modified By', type: 'user' }
];

export const COMMAND_CATEGORIES = [
  {
    id: 'create',
    label: 'Creation & Upload',
    icon: 'FolderPlus',
    description: 'New items, folders, files, and upload options',
    commands: {
      new: 'New Item / File',
      newComposite: 'New Composite',
      newFolder: 'New Folder',
      newWordDocument: 'Word Document',
      newExcelWorkbook: 'Excel Workbook',
      newPowerPointPresentation: 'PowerPoint Presentation',
      newOneNoteNotebook: 'OneNote Notebook',
      newFormsForExcel: 'Forms for Excel',
      newVisioDrawing: 'Visio Drawing',
      newLink: 'New Link',
      upload: 'Upload',
      UploadCommand: 'Upload Command',
      uploadFile: 'Upload Files',
      uploadFolder: 'Upload Folder',
      uploadTemplate: 'Upload Template',
      addTemplate: 'Add Template'
    }
  },
  {
    id: 'edit',
    label: 'Item Actions & Editing',
    icon: 'Edit3',
    description: 'Edit, grid view, rename, comments, and item history',
    commands: {
      edit: 'Edit Item',
      editInGridView: 'Edit in Grid View',
      exitGridView: 'Exit Grid View',
      rename: 'Rename',
      delete: 'Delete Item',
      comment: 'Comments',
      editNewMenu: 'Edit "New" Menu',
      open: 'Open',
      openInOfficeOnline: 'Open in Office Online',
      openInOfficeClient: 'Open in Office App',
      previewFileCommand: 'Preview File',
      openInImmersiveReader: 'Immersive Reader',
      properties: 'Properties',
      propertiesCommand: 'Properties Command',
      details: 'Details Pane',
      versionHistory: 'Version History',
      versionHistoryCommand: 'Version History Command'
    }
  },
  {
    id: 'sharing',
    label: 'Sharing & Access',
    icon: 'Share2',
    description: 'Share links, permissions, and compliance details',
    commands: {
      share: 'Share',
      copyLink: 'Copy Link',
      manageAccess: 'Manage Access',
      complianceDetails: 'Compliance Details',
      more: 'More Menu (...)'
    }
  },
  {
    id: 'automation',
    label: 'Automation, AI & Integrations',
    icon: 'Zap',
    description: 'Power Platform, rules, alerts, and Copilot',
    commands: {
      automate: 'Automate Menu',
      automateCreateRule: 'Create a Rule',
      automateManageRules: 'Manage Rules',
      integrate: 'Integrate Menu',
      powerAutomate: 'Power Automate',
      powerAutomateCreateFlow: 'Create Flow',
      powerAutomateSeeFlows: 'See Your Flows',
      powerAutomateConfigureFlows: 'Configure Flows',
      rules: 'Rules',
      rulesCommand: 'Rules Command',
      workflowsCommand: 'Workflows',
      quickStepsCommand: 'Quick Steps',
      approvalsCommand: 'Approvals',
      powerApps: 'Power Apps',
      powerAppsCreateApp: 'Create an App',
      powerAppsSeeAllApps: 'See All Apps',
      powerAppsCustomizeForms: 'Customize Forms',
      aiBuilder: 'AI Builder',
      aiBuilderCreate: 'AI Builder Create',
      aiBuilderGoto: 'AI Builder Go to',
      alertMe: 'Alert Me',
      manageAlert: 'Manage My Alerts',
      createCopilot: 'Create Copilot Agent',
      copilotCreate: 'Create Copilot Agent',
      Copilot: 'Copilot'
    }
  },
  {
    id: 'export',
    label: 'Export, BI & Transfer',
    icon: 'Download',
    description: 'Exporting datasets, Power BI, and file movements',
    commands: {
      export: 'Export Menu',
      exportExcel: 'Export to Excel',
      exportCSV: 'Export to CSV',
      powerBI: 'Power BI',
      powerBIVisualizeList: 'Power BI Visualize List',
      download: 'Download',
      moveTo: 'Move To',
      copyTo: 'Copy To',
      sync: 'Sync',
      syncCommand: 'Sync Command'
    }
  },
  {
    id: 'lifecycle',
    label: 'Document Lifecycle & Shortcuts',
    icon: 'Shield',
    description: 'Check-in/out, pinning, shortcuts, and forms management',
    commands: {
      checkOut: 'Check Out',
      checkIn: 'Check In',
      undoCheckOut: 'Undo Check Out',
      discardCheckOut: 'Discard Check Out',
      pinItem: 'Pin Item',
      pinItemCommand: 'Pin Item Command',
      pinToTop: 'Pin to Top',
      unpinFromTop: 'Unpin from Top',
      pinToQuickAccess: 'Pin to Quick Access',
      PinToQuickAccessCommand: 'Pin to Quick Access Command',
      unpinFromQuickAccess: 'Unpin from Quick Access',
      addShortcut: 'Add Shortcut',
      addShortcutToOneDriveCommand: 'Add Shortcut to OneDrive',
      stasherContextMenuCommand: 'Stasher Context Menu',
      'stasherCommand.myFiles': 'Shortcut to My Files',
      'stasherCommand.otherLocations': 'Shortcut to Other Locations',
      manageForms: 'Manage Forms',
      favoriteCommand: 'Favorite Command',
      PublishCommand: 'Publish Command',
      emptyRecycleBin: 'Empty Recycle Bin',
      restore: 'Restore Items',
      classifyAndExtract: 'Classify and Extract',
      viewDocumentUnderstandingModels: 'Document Understanding Models'
    }
  }
];

export const COMMON_FLUENT_ICONS = [
  'Edit', 'EditTable', 'Add', 'Delete', 'Share', 'Link', 'Download', 'Upload',
  'ExcelDocument', 'WordDocument', 'PowerPointDocument', 'View', 'Settings',
  'Sync', 'Pin', 'Automate', 'Flow', 'PowerBILogo', 'PowerApps', 'Robot',
  'CheckMark', 'Cancel', 'Filter', 'Sort', 'Search', 'Mail', 'Calendar', 'History'
];

export const COMMAND_LABELS = COMMAND_CATEGORIES.reduce((acc, cat) => ({
  ...acc,
  ...cat.commands
}), {});

export const DEFAULT_HIDDEN_COMMANDS = Object.keys(COMMAND_LABELS).reduce((acc, key) => ({
  ...acc,
  [key]: false
}), {});


export const DEFAULT_HEADER = [
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
];

export const DEFAULT_BODY = [
  { id: 1, title: 'General Information', fields: ['Title', 'Status', 'AssignedTo'] },
  { id: 2, title: 'Details', fields: ['Description', 'StartDate', 'DueDate', 'Priority'] }
];

export const DEFAULT_FOOTER = [
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
];

export const DEFAULT_VIS_CONDITIONS = [
  { id: 1, field: 'Status', type: 'choice', condition: '==', value: 'Completed' }
];

export const DRAFT_STORAGE_KEY = 'sp-form-helper-draft';
export const PRESETS_STORAGE_KEY = 'sp-custom-presets';
export const THEME_STORAGE_KEY = 'sp-helper-theme';

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function readStorageString(key, fallback = '') {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function writeStorageString(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to execCommand
    }
  }
  try {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.setAttribute('readonly', '');
    tempInput.style.position = 'fixed';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(tempInput);
    return ok;
  } catch {
    return false;
  }
}

export function isValidHex(value) {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function parseMsFontClass(classStr, fallback = 'ms-font-xl') {
  if (!classStr || typeof classStr !== 'string') return fallback;
  const match = classStr.match(/ms-font-(?:su|xl|l|m|s)\b/);
  return match ? match[0] : fallback;
}

export function quoteSharePointValue(cond) {
  if (cond.type === 'boolean') {
    return cond.value === 'false' || cond.value === false ? 'false' : 'true';
  }
  const raw = String(cond.value ?? '').trim();
  if (raw === '' || raw === "''" || raw === '""') return "''";

  // SharePoint reserved tokens (must NOT be quoted, otherwise SharePoint evaluates as literal string)
  if (raw === '@me' || raw === '@now' || raw.startsWith('@now')) {
    return raw;
  }

  if (cond.type === 'number' || /^-?\d+(\.\d+)?$/.test(raw)) {
    return raw;
  }
  return `'${raw.replace(/'/g, "''")}'`;
}

export function buildVisibilityFormula(visConditions, visLogicalOperator = 'AND') {
  if (!visConditions?.length) return '';

  const formatted = visConditions.map((cond) => {
    const fieldRef = `[$${cond.field}]`;
    return `${fieldRef} ${cond.condition} ${quoteSharePointValue(cond)}`;
  });

  if (formatted.length === 1) return `=${formatted[0]}`;

  const joiner = visLogicalOperator === 'OR' ? ' || ' : ' && ';
  return `=${formatted.join(joiner)}`;
}

export function sanitizeInternalName(name) {
  return String(name || '').trim().replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * Parses JSON.parse errors to pinpoint exact line number, column, problem snippet, and a helpful hint.
 */
export function diagnoseJsonError(jsonString, err) {
  const message = err?.message || 'Invalid JSON syntax';
  let line = null;
  let column = null;
  let snippet = '';
  let hint = 'Check for syntax issues such as missing quotes, trailing commas, or unmatched brackets.';

  if (typeof jsonString !== 'string') {
    return { success: false, error: message, line: null, column: null, snippet: '', hint };
  }

  // Try extracting line and column directly from error message
  const lineColMatch = message.match(/line (\d+) column (\d+)/i);
  if (lineColMatch) {
    line = parseInt(lineColMatch[1], 10);
    column = parseInt(lineColMatch[2], 10);
  } else {
    // Try extracting character position: "at position 142"
    const posMatch = message.match(/position (\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const lines = jsonString.slice(0, pos).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }
  }

  if (line !== null) {
    const allLines = jsonString.split('\n');
    const targetLine = allLines[line - 1] || '';
    snippet = targetLine.trim();

    if (snippet.endsWith(',')) {
      hint = 'Looks like a trailing comma. Standard JSON does not allow trailing commas after the last item.';
    } else if (snippet.includes(':') && !snippet.includes('"')) {
      hint = 'Property keys in JSON must be wrapped in double quotes (e.g. "key": "value").';
    } else if (snippet.includes("'")) {
      hint = 'JSON strings must use double quotes (") instead of single quotes (\').';
    } else if (snippet.includes('}') || snippet.includes(']')) {
      hint = 'Check for an extra comma before a closing bracket or curly brace.';
    }
  }

  return {
    success: false,
    error: message,
    line,
    column,
    snippet,
    hint
  };
}

/**
 * Encodes a complete workspace bundle into a shareable URL hash.
 */
export function encodeStateToShareUrl(bundle) {
  try {
    const json = JSON.stringify(bundle);
    const encoded = btoa(encodeURIComponent(json));
    const base = typeof window !== 'undefined' && window.location
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://benee76.github.io/Sharepoint-Form-Helper/';
    return `${base}#share=${encoded}`;
  } catch (e) {
    console.error('Failed to encode share URL:', e);
    return null;
  }
}

/**
 * Decodes a workspace bundle from a URL hash string.
 */
export function decodeStateFromShareHash(hash) {
  try {
    if (!hash || typeof hash !== 'string') return null;
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
    const params = new URLSearchParams(cleanHash);
    const shareData = params.get('share');
    if (!shareData) return null;
    const decoded = decodeURIComponent(atob(shareData));
    return JSON.parse(decoded);
  } catch (e) {
    console.error('Failed to decode share hash:', e);
    return null;
  }
}
