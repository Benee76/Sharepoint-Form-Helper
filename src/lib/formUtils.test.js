import { describe, expect, test } from 'vitest';
import {
  buildVisibilityFormula,
  parseMsFontClass,
  quoteSharePointValue,
  sanitizeInternalName,
  isValidHex,
  COMMAND_CATEGORIES,
  COMMAND_LABELS,
  COMMON_FLUENT_ICONS,
  diagnoseJsonError,
  encodeStateToShareUrl,
  decodeStateFromShareHash
} from './formUtils';

describe('buildVisibilityFormula', () => {
  test('quotes text values and uses && for AND', () => {
    const formula = buildVisibilityFormula([
      { field: 'Status', type: 'choice', condition: '==', value: 'Completed' },
      { field: 'Priority', type: 'choice', condition: '==', value: 'High' }
    ], 'AND');
    expect(formula).toBe("=[$Status] == 'Completed' && [$Priority] == 'High'");
  });

  test('escapes single quotes in values', () => {
    const formula = buildVisibilityFormula([
      { field: 'Title', type: 'text', condition: '==', value: "O'Brien" }
    ]);
    expect(formula).toBe("=[$Title] == 'O''Brien'");
  });

  test('treats empty string as quoted blank, not 0', () => {
    const formula = buildVisibilityFormula([
      { field: 'Status', type: 'choice', condition: '==', value: '' }
    ]);
    expect(formula).toBe("=[$Status] == ''");
  });

  test('emits booleans without quotes', () => {
    const formula = buildVisibilityFormula([
      { field: 'Approved', type: 'boolean', condition: '==', value: 'true' }
    ]);
    expect(formula).toBe('=[$Approved] == true');
  });

  test('emits @me token unquoted for SharePoint user evaluation', () => {
    const formula = buildVisibilityFormula([
      { field: 'Author', type: 'user', condition: '==', value: '@me' }
    ]);
    expect(formula).toBe('=[$Author] == @me');
  });

  test('emits @now token unquoted for SharePoint date evaluation', () => {
    const formula = buildVisibilityFormula([
      { field: 'DueDate', type: 'date', condition: '<=', value: '@now' }
    ]);
    expect(formula).toBe('=[$DueDate] <= @now');
  });

  test('handles explicit empty quote tokens', () => {
    const formula = buildVisibilityFormula([
      { field: 'Status', type: 'choice', condition: '!=', value: "''" }
    ]);
    expect(formula).toBe("=[$Status] != ''");
  });
});

describe('parseMsFontClass', () => {
  test('extracts font size from a class list', () => {
    expect(parseMsFontClass('ms-font-xl ms-fontWeight-semibold')).toBe('ms-font-xl');
  });

  test('uses fallback when missing', () => {
    expect(parseMsFontClass('', 'ms-font-m')).toBe('ms-font-m');
  });
});

describe('helpers', () => {
  test('sanitizeInternalName strips spaces but preserves underscores', () => {
    expect(sanitizeInternalName('Target Date')).toBe('TargetDate');
    expect(sanitizeInternalName('field_1')).toBe('field_1');
    expect(sanitizeInternalName('Domain_x003a_Title')).toBe('Domain_x003a_Title');
    expect(sanitizeInternalName('L1 Owner (Accountable)!')).toBe('L1OwnerAccountable');
  });

  test('isValidHex', () => {
    expect(isValidHex('#0078d4')).toBe(true);
    expect(isValidHex('#fff')).toBe(false);
    expect(isValidHex('red')).toBe(false);
  });

  test('quoteSharePointValue leaves numbers unquoted', () => {
    expect(quoteSharePointValue({ type: 'number', value: '12.5' })).toBe('12.5');
    expect(quoteSharePointValue({ type: 'number', value: 0 })).toBe('0');
  });

  test('quoteSharePointValue handles booleans', () => {
    expect(quoteSharePointValue({ type: 'boolean', value: 'false' })).toBe('false');
    expect(quoteSharePointValue({ type: 'boolean', value: false })).toBe('false');
    expect(quoteSharePointValue({ type: 'boolean', value: 'true' })).toBe('true');
  });

  test('buildVisibilityFormula handles OR operator', () => {
    const formula = buildVisibilityFormula([
      { field: 'Status', type: 'choice', condition: '==', value: 'Completed' },
      { field: 'Status', type: 'choice', condition: '==', value: 'Approved' }
    ], 'OR');
    expect(formula).toBe("=[$Status] == 'Completed' || [$Status] == 'Approved'");
  });

  test('COMMAND_CATEGORIES contains all required categories and commands', () => {
    const categoryIds = COMMAND_CATEGORIES.map(c => c.id);
    expect(categoryIds).toContain('create');
    expect(categoryIds).toContain('edit');
    expect(categoryIds).toContain('sharing');
    expect(categoryIds).toContain('automation');
    expect(categoryIds).toContain('export');
    expect(categoryIds).toContain('lifecycle');

    expect(COMMAND_LABELS.new).toBe('New Item / File');
    expect(COMMAND_LABELS.newComposite).toBe('New Composite');
    expect(COMMAND_LABELS.exportExcel).toBe('Export to Excel');
    expect(COMMAND_LABELS.copilotCreate).toBe('Create Copilot Agent');
    expect(COMMAND_LABELS.createCopilot).toBe('Create Copilot Agent');
    expect(COMMAND_LABELS.PublishCommand).toBe('Publish Command');
    expect(COMMAND_LABELS['stasherCommand.myFiles']).toBe('Shortcut to My Files');
  });

  test('COMMON_FLUENT_ICONS contains common SharePoint icons', () => {
    expect(COMMON_FLUENT_ICONS).toContain('EditTable');
    expect(COMMON_FLUENT_ICONS).toContain('Share');
    expect(COMMON_FLUENT_ICONS).toContain('Flow');
  });
});

describe('diagnoseJsonError', () => {
  test('detects trailing comma and returns line number and hint', () => {
    const badJson = '{\n  "name": "Title",\n  "type": "text",\n}';
    let caughtErr;
    try {
      JSON.parse(badJson);
    } catch (err) {
      caughtErr = err;
    }

    const res = diagnoseJsonError(badJson, caughtErr);
    expect(res.success).toBe(false);
    expect(res.line).toBeGreaterThanOrEqual(1);
    expect(res.hint).toMatch(/comma/i);
  });

  test('detects unquoted property keys and returns helpful hint', () => {
    const badJson = '{\n  name: "Title"\n}';
    let caughtErr;
    try {
      JSON.parse(badJson);
    } catch (err) {
      caughtErr = err;
    }

    const res = diagnoseJsonError(badJson, caughtErr);
    expect(res.success).toBe(false);
    expect(res.hint).toMatch(/quotes/i);
  });
});

describe('shareable URL hash', () => {
  test('encodes and decodes full workspace bundles round-trip', () => {
    const bundle = {
      $schema: 'https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json',
      header: [{ id: 1, title: 'Test Ticket' }],
      body: { sections: [{ displayname: 'Details', fields: ['Title', 'Status'] }] }
    };

    const shareUrl = encodeStateToShareUrl(bundle);
    expect(shareUrl).toContain('#share=');

    const hash = shareUrl.split('#')[1];
    const restored = decodeStateFromShareHash(hash);
    expect(restored).toEqual(bundle);
  });

  test('returns null gracefully on invalid hash', () => {
    expect(decodeStateFromShareHash('')).toBeNull();
    expect(decodeStateFromShareHash('junk-data')).toBeNull();
  });
});


