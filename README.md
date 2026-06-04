# SharePoint Formatter

## Overview

SharePoint Formatter is a specialized configuration tool designed to streamline the generation of JSON payloads for SharePoint Online custom formatting. It provides a visual interface for constructing complex Header, Body, and Footer layouts, as well as command bar overrides and conditional field visibility formulas.

[Website](https://sharepoint.andreas-benee.dk "GitHub Pages with the tool running for free use")

## Features

* **Header Customization:** Generate flexible top-level banners with support for custom text, icons, styling, and conditional visibility expressions.

* **Body Sectioning:** Easily define sections and field groupings to organize your SharePoint list or library forms.

* **Footer Management:** Build custom footer layouts including text blocks, dynamic links, and styling.

* **Command Bar Control:** Selectively hide or show default command bar actions (e.g., New, Edit, Share, Delete) for your views.

* **Visibility Formulas:** A dedicated utility for generating accurate conditional logic to show or hide fields based on list item values.

## Usage

1. Navigate to the relevant tab (Header, Body, Footer, Visibility, or Command Bar).

2. Adjust settings using the provided form controls.

3. The tool automatically generates the corresponding JSON or formula.

4. Copy the output from the generated code pane and apply it directly to your SharePoint list/library settings via the "Format this view" or "Format this form" interface.

## Technical Implementation

This application is built as a single-component React interface leveraging modern UI patterns and the `lucide-react` library for consistent iconography. The output adheres to the schemas required by the SharePoint Column and View Formatting framework.

## License

This project is licensed under the MIT License.
