import { KPI_DEFINITIONS } from "./kpiDefinitions.js";

const MILLION = 1_000_000;

export function num(value) {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function safeDivide(numerator, denominator) {
  const n = num(numerator);
  const d = num(denominator);
  if (n === null || d === null || d === 0) return null;
  return n / d;
}

export function get(row, column) {
  return row ? num(row[column]) : null;
}

const calc = {
  gross_oil_production: (r) => {
    const wells = get(r, "Producing Wells (N)");
    const rate = get(r, "Avg Well Rate (bopd/well)");
    return wells === null || rate === null ? null : wells * rate;
  },
  net_oil_production: (r) => {
    const gross = get(r, "Gross Oil Production (bopd)");
    const wi = get(r, "Working Interest (%)");
    const royalty = get(r, "Royalty Rate (%)");
    const govt = get(r, "Govt Share (%)");
    return [gross, wi, royalty, govt].some((v) => v === null) ? null : gross * wi * (1 - royalty) * (1 - govt);
  },
  production_efficiency: (r) => safeDivide(get(r, "Actual Production (bopd)"), get(r, "MER / Nameplate (bopd)")),
  production_deferment_rate: (r) => {
    const mer = get(r, "MER / Nameplate (bopd)");
    const actual = get(r, "Actual Production (bopd)");
    return mer === null || actual === null || mer === 0 ? null : (mer - actual) / mer;
  },
  uptime: (r) => safeDivide(get(r, "Producing Hours"), get(r, "Total Calendar Hours")),
  recovery_factor: (r) => safeDivide(get(r, "Cumulative Np (MMbbl)"), get(r, "OOIP (MMbbl)")),
  wor: (r) => safeDivide(get(r, "Water Rate Qw (bwpd)"), get(r, "Oil Rate Qo (bopd)")),
  water_cut: (r) => {
    const qw = get(r, "Water Rate Qw (bwpd)");
    const qo = get(r, "Oil Rate Qo (bopd)");
    return qw === null || qo === null || qo + qw === 0 ? null : qw / (qo + qw);
  },
  gor: (r) => safeDivide(get(r, "Gas Rate Qg (mmscfd)") * MILLION, get(r, "Oil Rate Qo (bopd)")),
  productivity_index: (r) => {
    const q = get(r, "Oil Rate Qo (bopd)");
    const drawdown = get(r, "Static BHP Pws (psi)") - get(r, "Flowing BHP Pwf (psi)");
    return safeDivide(q, drawdown);
  },
  depletion_rate: (r) => safeDivide(get(r, "Annual Production (MMboe)"), get(r, "PDP Reserves (MMboe)")),
  oee: (r) => {
    const a = get(r, "OEE Availability (%)");
    const p = get(r, "OEE Performance (%)");
    const q = get(r, "OEE Quality (%)");
    return [a, p, q].some((v) => v === null) ? null : a * p * q;
  },
  facility_utilization: (r) => safeDivide(get(r, "Actual Throughput (bopd)"), get(r, "Nameplate Capacity (bopd)")),
  compressor_availability: (r) => safeDivide(get(r, "Compressor Running Hrs"), get(r, "Calendar Hours")),
  compressor_utilization: (r) => safeDivide(get(r, "Compressor Actual (mmscfd)"), get(r, "Compressor Design (mmscfd)")),
  mtbf: (r) => safeDivide(get(r, "Total Uptime Hrs"), get(r, "Number of Failures")),
  mttr: (r) => safeDivide(get(r, "Total Repair Hrs"), get(r, "Number of Failures")),
  lifting_cost: (r) => safeDivide(get(r, "Total Opex ($M)"), get(r, "Total Production (MMboe)")),
  unit_technical_cost: (r) => {
    const lifting = get(r, "Lifting Cost ($/BOE)");
    const dda = get(r, "DD&A per BOE ($/BOE)");
    const exploration = get(r, "Exploration Cost per BOE ($/BOE)");
    return [lifting, dda, exploration].some((v) => v === null) ? null : lifting + dda + exploration;
  },
  opex_variance: (r) => {
    const actual = get(r, "Total Opex ($M)");
    const budget = get(r, "Budgeted Opex ($M)");
    return actual === null || budget === null || budget === 0 ? null : (actual - budget) / budget;
  },
  chemical_cost: (r) => safeDivide(get(r, "Chemical Spend ($M)"), get(r, "Total Production (MMboe)")),
  netback: (r) => {
    const price = get(r, "Realized Oil Price ($/bbl)");
    const royaltyRate = get(r, "Royalty Rate (%)");
    const taxes = get(r, "Production Taxes ($/BOE)");
    const lifting = get(r, "Lifting Cost ($/BOE)");
    const transport = get(r, "Transport Cost ($/BOE)");
    const processing = get(r, "Processing Cost ($/BOE)");
    if ([price, royaltyRate, taxes, lifting, transport, processing].some((v) => v === null)) return null;
    return price - price * royaltyRate - taxes - lifting - transport - processing;
  },
  break_even_price: (r) => {
    const cost = get(r, "Unit Technical Cost ($/BOE)");
    const taxRate = get(r, "Tax Rate (%)");
    return taxRate === null || taxRate === 1 ? null : safeDivide(cost, 1 - taxRate);
  },
  ebitda_per_boe: (r) => safeDivide(get(r, "EBITDA ($M)"), get(r, "Total Production (MMboe)")),
  fd_cost: (r) => safeDivide(get(r, "Total Capex ($M)"), get(r, "Reserve Additions (MMboe)")),
  recycle_ratio: (r) => safeDivide(get(r, "Netback ($/BOE)"), get(r, "F&D Cost ($/BOE)")),
  dc_per_ft: (r) => safeDivide(get(r, "Total Drilling Cost ($M)") * MILLION, get(r, "Total Footage Drilled (ft)")),
  rop: (r) => safeDivide(get(r, "Footage Drilled (ft)"), get(r, "Drilling Time (hrs)")),
  npt_rate: (r) => safeDivide(get(r, "NPT Hours"), get(r, "Total Rig Hours")),
  afe_variance: (r) => {
    const actual = get(r, "Actual Well Cost ($M)");
    const afe = get(r, "AFE Budget ($M)");
    return actual === null || afe === null || afe === 0 ? null : (actual - afe) / afe;
  },
  trir: (r) => safeDivide(get(r, "Recordable Incidents") * 200_000, get(r, "Man-Hours Worked")),
  ltif: (r) => safeDivide(get(r, "Lost Time Injuries (LTIs)") * MILLION, get(r, "Man-Hours Worked")),
  spill_recovery_rate: (r) => safeDivide(get(r, "Spills Recovered (bbl)"), get(r, "Spills Volume (bbl)")),
  flaring_intensity: (r) => safeDivide(get(r, "Gas Flared Daily (mmscfd)") * MILLION * 365, get(r, "Total Production (MMboe)") * MILLION),
  ghg_intensity: (r) => safeDivide(get(r, "Total Scope 1 Emissions (ktCO2e)") * MILLION, get(r, "Total Production (MMboe)") * MILLION),
  methane_intensity: (r) => {
    const emittedTonnes = get(r, "CH4 Emitted (kt CH4)") * 1000;
    const producedTonnes = get(r, "Total Gas Produced (MMscf)") * 19.2;
    return safeDivide(emittedTonnes, producedTonnes);
  },
  produced_water_reinjection_rate: (r) => safeDivide(get(r, "Produced Water Re-injected (MM bbl)"), get(r, "Produced Water (MM bbl)")),
  gas_capture_rate: (r) => safeDivide(get(r, "Gas Utilized (mmscfd)"), get(r, "Total Gas Produced (mmscfd)")),
  corrosion_rate: (r) => {
    const initial = get(r, "Initial Wall Thickness (mm)");
    const current = get(r, "Current Wall Thickness (mm)");
    const years = get(r, "Years of Measurement");
    return initial === null || current === null || years === null || years === 0 ? null : (initial - current) / years;
  },
  sce_compliance: (r) => safeDivide(get(r, "SCE Items Tested & Passed"), get(r, "SCE Items Due for Test")),
  inspection_compliance: (r) => safeDivide(get(r, "Inspections Completed"), get(r, "Inspections Due"))
};

export function calculateKpiValue(kpiId, row) {
  const fn = calc[kpiId];
  if (!fn) return null;
  const value = fn(row);
  return Number.isFinite(value) ? value : null;
}

export function computeKpisByCompany(cleanData) {
  return KPI_DEFINITIONS.flatMap((definition) => {
    const rows = cleanData.tables[definition.sheet]?.rows || [];
    return rows.map((row) => ({
      ...definition,
      company: row.Company,
      value: calculateKpiValue(definition.id, row),
      sourceRow: row
    }));
  }).filter((item) => item.value !== null && item.company);
}
