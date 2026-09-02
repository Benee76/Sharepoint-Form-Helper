import { expect, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders SharePoint Form Helper header', () => {
  render(<App />);
  const headerElement = screen.getByText(/SharePoint Form Helper/i);
  expect(headerElement).toBeDefined();
});

test('switches tabs and displays active config section', () => {
  render(<App />);
  const bodyTab = screen.getByRole('tab', { name: /Body Layout/i });
  fireEvent.click(bodyTab);
  expect(screen.getByText(/Body Sections & Columns/i)).toBeDefined();

  const footerTab = screen.getByRole('tab', { name: /Footer/i });
  fireEvent.click(footerTab);
  expect(screen.getByText(/Footer Blocks/i)).toBeDefined();

  const visibilityTab = screen.getByRole('tab', { name: /Visibility/i });
  fireEvent.click(visibilityTab);
  expect(screen.getByText(/Conditional Visibility/i)).toBeDefined();
});

test('toggles between interactive preview and code view, and selects Full Bundle', () => {
  render(<App />);
  const codeTab = screen.getByRole('tab', { name: /Code & Import/i });
  fireEvent.click(codeTab);
  expect(screen.getByText(/Import Existing SharePoint Formatting/i)).toBeDefined();

  // Test selecting Full Bundle format
  const fullBundleFmtBtn = screen.getByRole('tab', { name: /Full Bundle/i });
  fireEvent.click(fullBundleFmtBtn);
  expect(screen.getByText(/Full Workspace Bundle/i)).toBeDefined();
  expect(screen.getByRole('button', { name: /Download/i })).toBeDefined();

  const previewTab = screen.getByRole('tab', { name: /Interactive Preview/i });
  fireEvent.click(previewTab);
  expect(screen.getByText(/Mock Command Bar/i)).toBeDefined();
});

test('renders command bar quick setup options and supports presets', () => {
  render(<App />);
  const cmdTab = screen.getByRole('tab', { name: /Command Bar/i });
  fireEvent.click(cmdTab);
  
  expect(screen.getByText(/1\. Full Command Bar/i)).toBeDefined();
  expect(screen.getByText(/2\. No Special Tools/i)).toBeDefined();
  expect(screen.getByText(/3\. Only Add New/i)).toBeDefined();

  // Test applying "No Special Tools"
  const noToolsBtn = screen.getByText(/2\. No Special Tools/i);
  fireEvent.click(noToolsBtn);

  // Test expanding fine-tune details
  const detailsToggle = screen.getByText(/Fine-Tune Individual Commands & Details/i);
  fireEvent.click(detailsToggle);

  expect(screen.getByText(/Creation & Upload/i)).toBeDefined();
  expect(screen.getByText(/Automation, AI & Integrations/i)).toBeDefined();

  const searchInput = screen.getByPlaceholderText(/Search commands by name or key/i);
  fireEvent.change(searchInput, { target: { value: 'Copilot' } });
  const matches = screen.getAllByText(/Create Copilot Agent/i);
  expect(matches.length).toBeGreaterThan(0);
});

test('supports customizing command text and adding SPFx key', () => {
  render(<App />);
  const cmdTab = screen.getByRole('tab', { name: /Command Bar/i });
  fireEvent.click(cmdTab);

  // Expand fine-tune details
  const detailsToggle = screen.getByText(/Fine-Tune Individual Commands & Details/i);
  fireEvent.click(detailsToggle);

  // Test opening SPFx drawer
  const spfxBtn = screen.getByRole('button', { name: /SPFx \/ Custom Key/i });
  fireEvent.click(spfxBtn);
  expect(screen.getByText(/Add SPFx or Custom Command Key/i)).toBeDefined();

  // Test customizing an existing command
  const customizeBtn = screen.getByLabelText(/Customize Edit Item/i);
  fireEvent.click(customizeBtn);
  expect(screen.getByText(/Custom Display Text/i)).toBeDefined();
  expect(screen.getByText(/Fluent UI Icon/i)).toBeDefined();
});

test('supports adding conditions and clicking smart tokens in Visibility tab', () => {
  render(<App />);
  const visTab = screen.getByRole('tab', { name: /Visibility/i });
  fireEvent.click(visTab);

  // Click Add Condition button
  const addCondBtn = screen.getByRole('button', { name: /Add Condition Criteria/i });
  fireEvent.click(addCondBtn);
  expect(screen.getByText(/Conditions \(2\)/i)).toBeDefined();

  // Click the @me token chip
  const meTokenBtns = screen.getAllByRole('button', { name: /👤 @me/i });
  fireEvent.click(meTokenBtns[0]);
  expect(screen.getAllByText(/@me/i).length).toBeGreaterThan(0);

  // Click delete condition
  const deleteBtns = screen.getAllByTitle(/Delete condition criteria/i);
  fireEvent.click(deleteBtns[1]);
  expect(screen.getByText(/Conditions \(1\)/i)).toBeDefined();
});

test('supports toggling command visibility in Command Bar tab', () => {
  render(<App />);
  const cmdTab = screen.getByRole('tab', { name: /Command Bar/i });
  fireEvent.click(cmdTab);

  // Expand fine-tune details
  const detailsToggle = screen.getByText(/Fine-Tune Individual Commands & Details/i);
  fireEvent.click(detailsToggle);

  // Toggle Edit Item visibility button
  const editToggleBtn = screen.getByLabelText(/Toggle visibility of Edit Item/i);
  expect(editToggleBtn.textContent).toBe('VISIBLE');
  fireEvent.click(editToggleBtn);
  expect(editToggleBtn.textContent).toBe('HIDDEN');
});

test('renders templates guide and color palette editor in Presets tab', () => {
  render(<App />);
  const presetsTab = screen.getByRole('tab', { name: /Templates & Themes/i });
  fireEvent.click(presetsTab);

  // Template guide is collapsed by default; click button to open it
  const guideBtn = screen.getByRole('button', { name: /How do templates work\?/i });
  fireEvent.click(guideBtn);

  expect(screen.getByText(/How Custom Templates & Presets Work/i)).toBeDefined();
  expect(screen.getByText(/Color Palette Editor/i)).toBeDefined();
  expect(screen.getByText(/Edit Custom Color Palette/i)).toBeDefined();

  const applyPaletteBtn = screen.getByRole('button', { name: /Apply Palette to Form/i });
  fireEvent.click(applyPaletteBtn);
  expect(screen.getByText(/Applied to Form!/i)).toBeDefined();
});

test('supports filtering fields in Body Layout available pool', () => {
  render(<App />);
  const bodyTab = screen.getByRole('tab', { name: /Body Layout/i });
  fireEvent.click(bodyTab);

  const poolToggle = screen.getByRole('button', { name: /Manage Fields Pool/i });
  fireEvent.click(poolToggle);

  const filterInput = screen.getByPlaceholderText(/Filter fields by name, internal column, or type.../i);
  fireEvent.change(filterInput, { target: { value: 'Status' } });

  expect(screen.getByText(/Available Fields Pool \(1 of/i)).toBeDefined();
});

test('renders Undo, Redo, and Share controls in the header', () => {
  render(<App />);
  const undoBtn = screen.getByLabelText('Undo');
  const redoBtn = screen.getByLabelText('Redo');
  const shareBtn = screen.getByLabelText('Share workspace link');

  expect(undoBtn).toBeDefined();
  expect(redoBtn).toBeDefined();
  expect(shareBtn).toBeDefined();

  // Initially on blank mount with no edits, undo is disabled
  expect(undoBtn.hasAttribute('disabled')).toBe(true);
  expect(redoBtn.hasAttribute('disabled')).toBe(true);
});

test('supports switching viewport between Desktop and Mobile in Form Preview', () => {
  render(<App />);
  const mobileBtn = screen.getByRole('button', { name: /Mobile/i });
  const desktopBtn = screen.getByRole('button', { name: /Desktop/i });

  expect(mobileBtn).toBeDefined();
  expect(desktopBtn).toBeDefined();

  // Click Mobile
  fireEvent.click(mobileBtn);
  expect(mobileBtn.className).toContain('bg-blue-600');

  // Click Desktop
  fireEvent.click(desktopBtn);
  expect(desktopBtn.className).toContain('bg-blue-600');
});

test('renders and expands Formula Inspector in Form Preview', () => {
  render(<App />);
  // The inspector pill is displayed for the default condition
  const inspectorBtn = screen.getByTitle(/Click to view why fields are shown or hidden/i);
  expect(inspectorBtn).toBeDefined();

  // Click to expand inspector
  fireEvent.click(inspectorBtn);
  expect(screen.getByText(/Formula Inspector: Live Evaluation for/i)).toBeDefined();
  expect(screen.getByText(/PASSED ✓/i)).toBeDefined();
});

test('collapses Mock Command Bar preview by default and expands on click', () => {
  render(<App />);
  const toggleBtn = screen.getByTitle(/Click to toggle command bar preview/i);
  expect(toggleBtn).toBeDefined();
  expect(toggleBtn.textContent).toContain('Expand buttons ▾');

  // Click to expand
  fireEvent.click(toggleBtn);
  expect(toggleBtn.textContent).toContain('Collapse ▴');
  expect(screen.getByRole('button', { name: /New Item \/ File/i })).toBeDefined();

  // Click to collapse
  fireEvent.click(toggleBtn);
  expect(toggleBtn.textContent).toContain('Expand buttons ▾');
});

