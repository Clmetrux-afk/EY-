import { SHEET_DOMAINS } from "./kpiDefinitions.js";
import * as XLSX from "xlsx";

function cleanHeader(value) {
  return String(value ?? "").trim();
}

function normalizeCell(value) {
  return value === undefined || value === "" ? null : value;
}

function rowToObject(headers, row) {
  return headers.reduce((record, header, index) => {
    if (header) record[header] = normalizeCell(row[index]);
    return record;
  }, {});
}

export function parseWorkbook(workbook) {
  const tables = {};
  const diagnostics = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    const headerIndex = matrix.findIndex((row) => cleanHeader(row[0]) === "#" && cleanHeader(row[1]) === "Company");

    if (headerIndex === -1) {
      diagnostics.push({ sheetName, type: "descriptive", note: "No # / Company header row detected." });
      return;
    }

    const headers = matrix[headerIndex].map(cleanHeader);
    const rows = matrix.slice(headerIndex + 1)
      .map((row) => rowToObject(headers, row))
      .filter((row) => row.Company && String(row.Company).toUpperCase() !== "AVERAGE");

    tables[sheetName] = {
      sheetName,
      domain: SHEET_DOMAINS[sheetName] || "Other",
      headerRow: headerIndex + 1,
      descriptiveRows: matrix.slice(0, headerIndex).map((row) => row.filter((cell) => cell !== null).join(" | ")).filter(Boolean),
      columns: headers.filter(Boolean),
      rows
    };

    diagnostics.push({ sheetName, type: "data_table", headerRow: headerIndex + 1, rows: rows.length, columns: headers.filter(Boolean).length });
  });

  return { generatedAt: new Date().toISOString(), tables, diagnostics };
}

export async function readExcelFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  return parseWorkbook(workbook);
}

export async function loadDefaultWorkbook() {
  const jsonResponse = await fetch("./cleaned_data_model.json");
  if (jsonResponse.ok) return jsonResponse.json();

  let response = await fetch("./EY_OilGas_KPI_DummyData.xlsx");
  if (!response.ok) response = await fetch("./public/EY_OilGas_KPI_DummyData.xlsx");
  if (!response.ok) throw new Error("Default workbook unavailable. Upload the Excel file to continue.");
  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  return parseWorkbook(workbook);
}
