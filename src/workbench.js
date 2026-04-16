import { DOMAIN_ORDER, KPI_DEFINITIONS } from "./kpiDefinitions.js";
import { computeKpisByCompany } from "./kpiCalculations.js";
import { loadDefaultWorkbook, readExcelFile } from "./excelParser.js";
import { benchmark, formatValue, trendFor } from "./formatters.js";
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const FOCUS_KPI_IDS = ["net_oil_production", "production_efficiency", "uptime", "recovery_factor", "depletion_rate", "oee", "lifting_cost", "netback", "break_even_price", "ebitda_per_boe", "recycle_ratio", "trir", "flaring_intensity", "ghg_intensity", "methane_intensity", "gas_capture_rate", "sce_compliance"];
const VIEW_MODES = ["ranking", "bar", "line", "area", "heatmap", "calculation", "table"];
const h = (type, props, ...children) => React.createElement(type, props, ...children);

function EyLogo() {
  return h("div", { className: "ey-logo", "aria-label": "EY" }, h("span", { className: "ey-logo-mark" }), h("strong", null, "EY"));
}

function Header({ status }) {
  return h("header", { className: "app-header" },
    h("div", { className: "brand" }, h(EyLogo), h("div", null, h("p", { className: "ey-kicker" }, "Upstream Oil & Gas Analytics"), h("h1", null, "KPI Workbench"))),
    h("div", { className: "status-pill" }, status)
  );
}

function toggleCompany(selectedCompanies, company) {
  return selectedCompanies.includes(company) ? selectedCompanies.filter((item) => item !== company) : [...selectedCompanies, company];
}

function SidePanel(props) {
  return h("aside", { className: "filter-panel" },
    h("label", { className: "upload-zone" }, h("span", null, "Load workbook"), h("small", null, "Excel drives every number"), h("input", { type: "file", accept: ".xlsx,.xls", onChange: props.onUpload })),
    h("div", { className: "control" },
      h("label", null, "Companies"),
      h("div", { className: "quick-row" }, h("button", { onClick: () => props.setSelectedCompanies(props.companies) }, "All"), h("button", { onClick: () => props.setSelectedCompanies(props.companies.slice(0, 3)) }, "Top 3"), h("button", { onClick: () => props.setSelectedCompanies([]) }, "Clear")),
      h("div", { className: "company-list" }, props.companies.map((company) => h("label", { className: "check-row", key: company }, h("input", { type: "checkbox", checked: props.selectedCompanies.includes(company), onChange: () => props.setSelectedCompanies(toggleCompany(props.selectedCompanies, company)) }), h("span", null, company))))
    ),
    h("div", { className: "control" }, h("label", null, "Domain"), h("select", { value: props.domain, onChange: (event) => props.setDomain(event.target.value) }, ["All Domains", ...DOMAIN_ORDER].map((item) => h("option", { key: item, value: item }, item)))),
    h("div", { className: "control" }, h("label", null, "KPI Set"), h("div", { className: "segmented two" }, ["Focus", "All"].map((setName) => h("button", { key: setName, className: props.kpiSet === setName ? "active" : "", onClick: () => props.setKpiSet(setName) }, setName)))),
    h("div", { className: "control" }, h("label", null, "View"), h("div", { className: "segmented" }, VIEW_MODES.map((mode) => h("button", { key: mode, className: props.viewMode === mode ? "active" : "", onClick: () => props.setViewMode(mode) }, mode)))),
    h("div", { className: "control" }, h("label", null, "Details"), h("div", { className: "detail-toggles" }, [["formula", "Formula"], ["inputs", "Inputs"], ["excel", "Excel columns"], ["assumptions", "Assumptions"], ["mapping", "Mapping table"]].map(([key, label]) => h("label", { className: "check-row compact-check", key }, h("input", { type: "checkbox", checked: props.visibleDetails[key], onChange: () => props.setVisibleDetails({ ...props.visibleDetails, [key]: !props.visibleDetails[key] }) }), h("span", null, label)))))
  );
}

function DataModel({ cleanData, domain, setDomain }) {
  const tables = (cleanData?.diagnostics || []).filter((item) => item.type === "data_table");
  const domainBySheet = Object.fromEntries(Object.entries(cleanData?.tables || {}).map(([sheetName, table]) => [sheetName, table.domain]));
  const domains = [...new Set(tables.map((item) => domainBySheet[item.sheetName]).filter(Boolean))];
  return h("section", { className: "data-strip compact" },
    h("button", { className: `data-chip domain-button ${domain === "All Domains" ? "active" : ""}`, onClick: () => setDomain("All Domains") }, h("strong", null, "All Domains")),
    domains.map((item) => h("button", { className: `data-chip domain-button ${domain === item ? "active" : ""}`, key: item, onClick: () => setDomain(item) }, h("strong", null, item)))
  );
}

function Summary({ selectedCompanies, records, kpiSet }) {
  const kpiCount = new Set(records.map((record) => record.id)).size;
  return h("section", { className: "workspace-summary" }, h("div", null, h("span", null, "Companies"), h("strong", null, selectedCompanies.length)), h("div", null, h("span", null, "KPI Set"), h("strong", null, kpiSet)), h("div", null, h("span", null, "Visible KPIs"), h("strong", null, kpiCount)));
}

function DetailBlocks({ record, visibleDetails, compact = false }) {
  const blocks = [visibleDetails.formula && ["Formula", record.formula], visibleDetails.inputs && ["Inputs", record.requiredInputs.join("; ")], visibleDetails.excel && ["Excel columns", record.excelColumns.join("; ")], visibleDetails.assumptions && ["Assumptions", record.assumptions]].filter(Boolean);
  if (!blocks.length) return null;
  return h("div", { className: compact ? "detail-blocks compact-details" : "detail-blocks" }, blocks.map(([label, value]) => h("div", { className: "detail-block", key: label }, h("span", null, label), h("p", null, value))));
}

function ValueCard({ record, allRecords, visibleDetails }) {
  const stats = benchmark(allRecords.filter((item) => item.id === record.id), record);
  const trend = stats ? trendFor(record.value, stats.average, record.lowerIsBetter) : { tone: "flat", delta: 0 };
  return h("article", { className: "kpi-card compact-card", title: `${record.formula}\n${record.assumptions}` }, h("div", { className: "card-top" }, h("span", null, record.company), h("b", { className: `trend ${trend.tone}` }, `${trend.delta >= 0 ? "+" : ""}${(trend.delta * 100).toFixed(1)}%`)), h("h3", null, record.name), h("p", { className: "kpi-value" }, formatValue(record.value, record.format, record.unit)), stats && h("small", null, `Avg ${formatValue(stats.average, record.format, record.unit)}`), h(DetailBlocks, { record, visibleDetails, compact: true }));
}

function ValueSection({ activeKpi, records, allRecords, visibleDetails }) {
  const activeRecords = records.filter((record) => record.id === activeKpi);
  if (!activeRecords.length) return null;
  return h("section", { className: "domain-section" }, h("div", { className: "section-heading tight" }, h("h2", null, "Values"), h("span", null, activeRecords[0].name)), h("div", { className: "kpi-grid values-only" }, activeRecords.map((record) => h(ValueCard, { key: `${record.company}-${record.id}`, record, allRecords, visibleDetails }))));
}

function CalculationView({ records, visibleDetails }) {
  if (!records.length) return null;
  return h("div", { className: "calc-bridge slim" }, visibleDetails.formula && h("div", { className: "formula-box" }, records[0].formula), h("div", { className: "calc-columns" }, records.map((record) => h("div", { className: "calc-company", key: record.company }, h("h3", null, record.company), h("strong", null, formatValue(record.value, record.format, record.unit)), visibleDetails.inputs && h("div", { className: "bridge-grid" }, record.requiredInputs.map((input) => h("div", { className: "bridge-step", key: input }, h("span", null, input), h("b", null, record.sourceRow?.[input] ?? "n/a")))), h(DetailBlocks, { record, visibleDetails }))))) ;
}

function HeatmapView({ records, kpis, selectedCompanies }) {
  const rows = kpis.map((kpi) => { const rowRecords = records.filter((record) => record.id === kpi.id); const values = rowRecords.map((record) => record.value); return { kpi, rowRecords, min: Math.min(...values), max: Math.max(...values) }; }).filter((row) => row.rowRecords.length);
  return h("div", { className: "heatmap" }, h("div", { className: "heat-head" }, h("span", null, "KPI"), selectedCompanies.map((company) => h("span", { key: company }, company))), rows.map((row) => h("div", { className: "heat-row", key: row.kpi.id }, h("strong", null, row.kpi.name), selectedCompanies.map((company) => { const record = row.rowRecords.find((item) => item.company === company); const score = !record || row.max === row.min ? 0.5 : (record.value - row.min) / (row.max - row.min); const normalized = row.kpi.lowerIsBetter ? 1 - score : score; return h("span", { className: "heat-cell", key: company, style: { backgroundColor: `rgba(255, 230, 0, ${0.15 + normalized * 0.75})` } }, record ? formatValue(record.value, record.format, record.unit) : "n/a"); }))));
}

function TableView({ records }) {
  return h("div", { className: "table-wrap short" }, h("table", null, h("thead", null, h("tr", null, ["Company", "KPI", "Value", "Formula", "Inputs"].map((head) => h("th", { key: head }, head)))), h("tbody", null, records.map((record) => h("tr", { key: `${record.company}-${record.id}` }, h("td", null, record.company), h("td", null, record.name), h("td", null, formatValue(record.value, record.format, record.unit)), h("td", null, record.formula), h("td", null, record.requiredInputs.join("; ")))))));
}

function AnalysisView({ records, viewMode, activeKpi, setActiveKpi, availableKpis, selectedCompanies, visibleDetails }) {
  const selectedKpi = availableKpis.find((kpi) => kpi.id === activeKpi) || availableKpis[0];
  const activeRecords = records.filter((record) => record.id === selectedKpi?.id);
  const stats = selectedKpi ? benchmark(activeRecords, selectedKpi) : null;
  const chartData = activeRecords.map((record) => ({ company: record.company, value: record.value }));
  const common = { data: chartData, margin: { top: 16, right: 24, bottom: 16, left: 16 } };
  const axes = [h(CartesianGrid, { key: "grid", stroke: "#e8e8e8", strokeDasharray: "4 4" }), h(XAxis, { key: "x", dataKey: "company", tick: { fontSize: 11 } }), h(YAxis, { key: "y", tick: { fontSize: 11 } }), h(Tooltip, { key: "tip" }), h(Legend, { key: "legend" })];
  const bars = h(BarChart, common, ...axes, stats && h(ReferenceLine, { y: stats.average, stroke: "#b42318", strokeDasharray: "4 4", label: "Avg" }), h(Bar, { dataKey: "value", radius: [4, 4, 0, 0] }, chartData.map((entry, index) => h(Cell, { key: entry.company, fill: index === 0 ? "#ffe600" : "#111" }))));
  const lines = h(LineChart, common, ...axes, h(Line, { type: "monotone", dataKey: "value", stroke: "#111", strokeWidth: 3, dot: { fill: "#ffe600", stroke: "#111", strokeWidth: 2 } }));
  const areas = h(AreaChart, common, ...axes, h(Area, { type: "monotone", dataKey: "value", stroke: "#111", fill: "#ffe600", fillOpacity: 0.35 }));
  const chart = viewMode === "heatmap" ? h(HeatmapView, { records, kpis: availableKpis, selectedCompanies }) : viewMode === "calculation" ? h(CalculationView, { records: activeRecords, visibleDetails }) : viewMode === "table" ? h(TableView, { records }) : h(ResponsiveContainer, { width: "100%", height: 380 }, viewMode === "line" ? lines : viewMode === "area" ? areas : bars);
  return h("section", { className: "chart-section" }, h("div", { className: "section-heading tight" }, h("h2", null, "Analyze"), h("select", { value: selectedKpi?.id || "", onChange: (event) => setActiveKpi(event.target.value) }, availableKpis.map((kpi) => h("option", { key: kpi.id, value: kpi.id }, kpi.name)))), h("div", { className: "chart-frame flexible" }, chart));
}

function MappingTable() {
  return h("section", { className: "mapping-section" }, h("div", { className: "section-heading tight" }, h("h2", null, "Mapping"), h("span", null, `${KPI_DEFINITIONS.length} definitions`)), h("div", { className: "table-wrap" }, h("table", null, h("thead", null, h("tr", null, ["KPI", "Formula", "Required Inputs", "Excel Columns", "Assumptions"].map((head) => h("th", { key: head }, head)))), h("tbody", null, KPI_DEFINITIONS.map((kpi) => h("tr", { key: kpi.id }, h("td", null, kpi.name), h("td", null, kpi.formula), h("td", null, kpi.requiredInputs.join("; ")), h("td", null, kpi.excelColumns.join("; ")), h("td", null, kpi.assumptions)))))));
}

function App() {
  const [cleanData, setCleanData] = useState(null);
  const [status, setStatus] = useState("Loading workbook");
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [domain, setDomain] = useState("All Domains");
  const [viewMode, setViewMode] = useState("ranking");
  const [kpiSet, setKpiSet] = useState("Focus");
  const [activeKpi, setActiveKpi] = useState("production_efficiency");
  const [visibleDetails, setVisibleDetails] = useState({ formula: false, inputs: false, excel: false, assumptions: false, mapping: false });
  useEffect(() => { loadDefaultWorkbook().then((data) => { setCleanData(data); setStatus("Workbook loaded"); }).catch((error) => setStatus(error.message)); }, []);
  const allRecords = useMemo(() => cleanData ? computeKpisByCompany(cleanData) : [], [cleanData]);
  const companies = useMemo(() => [...new Set(allRecords.map((record) => record.company))], [allRecords]);
  useEffect(() => { if (!selectedCompanies.length && companies.length) setSelectedCompanies([companies[0]]); }, [companies, selectedCompanies.length]);
  const kpiIds = kpiSet === "Focus" ? FOCUS_KPI_IDS : KPI_DEFINITIONS.map((kpi) => kpi.id);
  const filteredRecords = allRecords.filter((record) => kpiIds.includes(record.id) && selectedCompanies.includes(record.company) && (domain === "All Domains" || record.domain === domain));
  const availableKpis = KPI_DEFINITIONS.filter((kpi) => kpiIds.includes(kpi.id) && (domain === "All Domains" || kpi.domain === domain) && filteredRecords.some((record) => record.id === kpi.id));
  useEffect(() => { if (availableKpis.length && !availableKpis.some((kpi) => kpi.id === activeKpi)) setActiveKpi(availableKpis[0].id); }, [availableKpis, activeKpi]);
  async function handleUpload(event) { const file = event.target.files?.[0]; if (!file) return; setStatus(`Reading ${file.name}`); try { const data = await readExcelFile(file); setCleanData(data); setSelectedCompanies([]); setStatus(`${file.name} loaded`); } catch (error) { setStatus(error.message); } }
  return h(React.Fragment, null, h(Header, { status }), h("main", { className: "shell" }, h(SidePanel, { onUpload: handleUpload, companies, selectedCompanies, setSelectedCompanies, domain, setDomain, viewMode, setViewMode, kpiSet, setKpiSet, visibleDetails, setVisibleDetails }), h("div", { className: "content" }, cleanData && h(DataModel, { cleanData, domain, setDomain }), h(Summary, { selectedCompanies, records: filteredRecords, kpiSet }), h(AnalysisView, { records: filteredRecords, viewMode, activeKpi, setActiveKpi, availableKpis, selectedCompanies, visibleDetails }), h(ValueSection, { activeKpi, records: filteredRecords, allRecords, visibleDetails }), visibleDetails.mapping && h(MappingTable))));
}

createRoot(document.getElementById("root")).render(h(App));
