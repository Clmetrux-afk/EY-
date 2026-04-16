# EY Upstream Oil & Gas KPI Workbench

A React KPI workbench for upstream oil and gas analytics. The app parses workbook-style operational data, maps KPIs to framework formulas, computes KPI values dynamically, and supports flexible company comparison views.

## Features

- Company selection for one, many, or all companies
- Domain buttons for production, reservoir, operations, cost, drilling, HSE/ESG, and asset integrity
- KPI set switch between focused and full KPI catalogue
- View modes: ranking, bar, line, area, heatmap, calculation, and table
- Optional detail toggles for formula, inputs, Excel columns, assumptions, and mapping table
- Client-side Excel upload using SheetJS
- Default cleaned data model included for hosted demo use

## Local Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

This repository includes a GitHub Pages workflow. After GitHub Pages is configured to use GitHub Actions, pushes to `main` build and publish the site.
