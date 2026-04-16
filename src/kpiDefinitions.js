export const DOMAIN_ORDER = [
  "Production Performance",
  "Reservoir & Well Performance",
  "Operational Efficiency",
  "Cost & Financial Metrics",
  "Drilling & Completions",
  "HSE / ESG",
  "Asset Integrity"
];

export const SHEET_DOMAINS = {
  S1_Production: "Production Performance",
  S2_Reservoir_Well: "Reservoir & Well Performance",
  S3_Operational_Eff: "Operational Efficiency",
  S4_Lifting_Costs: "Cost & Financial Metrics",
  S5_Drilling: "Drilling & Completions",
  S6_HSE: "HSE / ESG",
  S7_Asset_Integrity: "Asset Integrity",
  S8_Financial: "Cost & Financial Metrics",
  S9_ESG_Environmental: "HSE / ESG"
};

const d = (id, name, domain, sheet, formula, requiredInputs, excelColumns, assumptions, unit, format = "number", extra = {}) => ({
  id, name, domain, sheet, formula, requiredInputs, excelColumns, assumptions, unit, format,
  description: extra.description || name,
  lowerIsBetter: Boolean(extra.lowerIsBetter)
});

export const KPI_DEFINITIONS = [
  d("gross_oil_production", "Gross Oil Production", "Production Performance", "S1_Production", "Gross Oil (bopd) = sum of oil rates", ["Producing Wells (N)", "Avg Well Rate (bopd/well)"], ["Producing Wells (N)", "Avg Well Rate (bopd/well)", "Gross Oil Production (bopd)"], "Aggregate well count and average rate are used.", "bopd"),
  d("net_oil_production", "Net Oil Production", "Production Performance", "S1_Production", "Net Production = Gross Production x Working Interest% x (1 - Royalty%) x (1 - Govt Share%)", ["Gross Oil Production (bopd)", "Working Interest (%)", "Royalty Rate (%)", "Govt Share (%)"], ["Gross Oil Production (bopd)", "Working Interest (%)", "Royalty Rate (%)", "Govt Share (%)", "Net Oil Production (bopd)"], "Percent fields are stored as fractions.", "bopd"),
  d("production_efficiency", "Production Efficiency", "Production Performance", "S1_Production", "PE (%) = Actual Production / MER x 100", ["Actual Production (bopd)", "MER / Nameplate (bopd)"], ["Actual Production (bopd)", "MER / Nameplate (bopd)", "Production Efficiency (%)"], "MER/nameplate is the denominator.", "%", "percent"),
  d("production_deferment_rate", "Production Deferment Rate", "Production Performance", "S1_Production", "Deferment Rate (%) = (MER - Actual) / MER x 100", ["MER / Nameplate (bopd)", "Actual Production (bopd)"], ["MER / Nameplate (bopd)", "Actual Production (bopd)", "Deferment Rate (%)"], "Negative deferment is retained when actual exceeds MER.", "%", "percent", { lowerIsBetter: true }),
  d("uptime", "Uptime / Availability", "Production Performance", "S1_Production", "Uptime (%) = Producing Hours / Total Calendar Hours x 100", ["Producing Hours", "Total Calendar Hours"], ["Producing Hours", "Total Calendar Hours", "Uptime (%)"], "Annual calendar hours are used.", "%", "percent"),

  d("recovery_factor", "Recovery Factor", "Reservoir & Well Performance", "S2_Reservoir_Well", "RF (%) = Cumulative Production / OOIP x 100", ["Cumulative Np (MMbbl)", "OOIP (MMbbl)"], ["Cumulative Np (MMbbl)", "OOIP (MMbbl)", "Recovery Factor (%)"], "Both inputs are in MMbbl.", "%", "percent"),
  d("wor", "Water-Oil Ratio", "Reservoir & Well Performance", "S2_Reservoir_Well", "WOR = Qw / Qo", ["Water Rate Qw (bwpd)", "Oil Rate Qo (bopd)"], ["Water Rate Qw (bwpd)", "Oil Rate Qo (bopd)", "WOR (bbl/bbl)"], "Company aggregate rates are used.", "bbl/bbl", "ratio", { lowerIsBetter: true }),
  d("water_cut", "Water Cut", "Reservoir & Well Performance", "S2_Reservoir_Well", "Water Cut (%) = Qw / (Qo + Qw) x 100", ["Water Rate Qw (bwpd)", "Oil Rate Qo (bopd)"], ["Water Rate Qw (bwpd)", "Oil Rate Qo (bopd)", "Water Cut (%)"], "Total liquid is Qo + Qw.", "%", "percent", { lowerIsBetter: true }),
  d("gor", "Gas-Oil Ratio", "Reservoir & Well Performance", "S2_Reservoir_Well", "GOR = Qg / Qo", ["Gas Rate Qg (mmscfd)", "Oil Rate Qo (bopd)"], ["Gas Rate Qg (mmscfd)", "Oil Rate Qo (bopd)", "GOR (scf/bbl)"], "mmscfd is converted to scf/day.", "scf/bbl", "number", { lowerIsBetter: true }),
  d("productivity_index", "Productivity Index", "Reservoir & Well Performance", "S2_Reservoir_Well", "PI = Q / (Pws - Pwf)", ["Oil Rate Qo (bopd)", "Static BHP Pws (psi)", "Flowing BHP Pwf (psi)"], ["Oil Rate Qo (bopd)", "Static BHP Pws (psi)", "Flowing BHP Pwf (psi)", "Productivity Index (stb/d/psi)"], "Oil rate Qo is used as Q.", "stb/d/psi"),
  d("depletion_rate", "PDP Depletion Rate", "Reservoir & Well Performance", "S2_Reservoir_Well", "PDP Depletion Rate (%) = Annual Production / PDP Reserves x 100", ["Annual Production (MMboe)", "PDP Reserves (MMboe)"], ["Annual Production (MMboe)", "PDP Reserves (MMboe)", "PDP Depletion Rate (%/yr)"], "Both inputs are in MMboe.", "%/yr", "percent", { lowerIsBetter: true }),

  d("oee", "Overall Equipment Effectiveness", "Operational Efficiency", "S3_Operational_Eff", "OEE = Availability x Performance x Quality", ["OEE Availability (%)", "OEE Performance (%)", "OEE Quality (%)"], ["OEE Availability (%)", "OEE Performance (%)", "OEE Quality (%)", "OEE (%)"], "Components are fractions.", "%", "percent"),
  d("facility_utilization", "Facility Utilization", "Operational Efficiency", "S3_Operational_Eff", "Facility Utilization (%) = Actual Throughput / Nameplate Capacity x 100", ["Actual Throughput (bopd)", "Nameplate Capacity (bopd)"], ["Actual Throughput (bopd)", "Nameplate Capacity (bopd)", "Facility Utilization (%)"], "Throughput basis is oil processing.", "%", "percent"),
  d("compressor_availability", "Compressor Availability", "Operational Efficiency", "S3_Operational_Eff", "Compressor Availability (%) = Running Hours / Calendar Hours x 100", ["Compressor Running Hrs", "Calendar Hours"], ["Compressor Running Hrs", "Calendar Hours", "Compressor Avail (%)"], "Annual hours are used.", "%", "percent"),
  d("compressor_utilization", "Compressor Utilization", "Operational Efficiency", "S3_Operational_Eff", "Compressor Utilization (%) = Actual Throughput / Design Capacity x 100", ["Compressor Actual (mmscfd)", "Compressor Design (mmscfd)"], ["Compressor Actual (mmscfd)", "Compressor Design (mmscfd)", "Compressor Util (%)"], "Both fields are mmscfd.", "%", "percent"),
  d("mtbf", "MTBF", "Operational Efficiency", "S3_Operational_Eff", "MTBF = Total Operating Hours / Number of Failures", ["Total Uptime Hrs", "Number of Failures"], ["Total Uptime Hrs", "Number of Failures", "MTBF (hrs)"], "Uptime is used as operating hours.", "hrs"),
  d("mttr", "MTTR", "Operational Efficiency", "S3_Operational_Eff", "MTTR = Total Repair Hours / Number of Failures", ["Total Repair Hrs", "Number of Failures"], ["Total Repair Hrs", "Number of Failures", "MTTR (hrs)"], "Failure count is used as repair count.", "hrs", "number", { lowerIsBetter: true }),

  d("lifting_cost", "Lifting Cost", "Cost & Financial Metrics", "S4_Lifting_Costs", "Lifting Cost = Total Opex / Total Production", ["Total Opex ($M)", "Total Production (MMboe)"], ["Total Opex ($M)", "Total Production (MMboe)", "Lifting Cost ($/BOE)"], "$M/MMboe equals $/BOE.", "$/BOE", "currency", { lowerIsBetter: true }),
  d("unit_technical_cost", "Unit Technical Cost", "Cost & Financial Metrics", "S4_Lifting_Costs", "UTC = Lifting Cost + DD&A per BOE + Exploration Cost per BOE", ["Lifting Cost ($/BOE)", "DD&A per BOE ($/BOE)", "Exploration Cost per BOE ($/BOE)"], ["Lifting Cost ($/BOE)", "DD&A per BOE ($/BOE)", "Exploration Cost per BOE ($/BOE)", "Unit Technical Cost ($/BOE)"], "Financing cost is not available.", "$/BOE", "currency", { lowerIsBetter: true }),
  d("opex_variance", "Opex Variance vs Budget", "Cost & Financial Metrics", "S4_Lifting_Costs", "Variance (%) = (Actual Opex - Budgeted Opex) / Budgeted Opex x 100", ["Total Opex ($M)", "Budgeted Opex ($M)"], ["Total Opex ($M)", "Budgeted Opex ($M)", "Opex Variance (%)"], "Annual actual and budget are compared.", "%", "percent", { lowerIsBetter: true }),
  d("chemical_cost", "Chemical Cost per BOE", "Cost & Financial Metrics", "S4_Lifting_Costs", "Chemical Cost = Chemical Spend / Total Production", ["Chemical Spend ($M)", "Total Production (MMboe)"], ["Chemical Spend ($M)", "Total Production (MMboe)", "Chemical Cost ($/BOE)"], "$M/MMboe equals $/BOE.", "$/BOE", "currency", { lowerIsBetter: true }),
  d("netback", "Netback per BOE", "Cost & Financial Metrics", "S4_Lifting_Costs", "Netback = Realized Price - Royalties - Production Taxes - Lifting Cost - Transportation - Processing", ["Realized Oil Price ($/bbl)", "Royalty Rate (%)", "Production Taxes ($/BOE)", "Lifting Cost ($/BOE)", "Transport Cost ($/BOE)", "Processing Cost ($/BOE)"], ["Realized Oil Price ($/bbl)", "Royalty Rate (%)", "Production Taxes ($/BOE)", "Lifting Cost ($/BOE)", "Transport Cost ($/BOE)", "Processing Cost ($/BOE)", "Netback ($/BOE)"], "Royalty dollars are price x royalty rate.", "$/BOE", "currency"),
  d("break_even_price", "Break-Even Oil Price", "Cost & Financial Metrics", "S4_Lifting_Costs", "Break-Even Price = Total Cost / (1 - Tax Rate)", ["Unit Technical Cost ($/BOE)", "Tax Rate (%)"], ["Unit Technical Cost ($/BOE)", "Tax Rate (%)", "Break-Even Price ($/bbl)"], "UTC represents total cost.", "$/bbl", "currency", { lowerIsBetter: true }),
  d("ebitda_per_boe", "EBITDA per BOE", "Cost & Financial Metrics", "S8_Financial", "EBITDA per BOE = EBITDA / Production", ["EBITDA ($M)", "Total Production (MMboe)"], ["EBITDA ($M)", "Total Production (MMboe)", "EBITDA per BOE ($/BOE)"], "$M/MMboe equals $/BOE.", "$/BOE", "currency"),
  d("fd_cost", "F&D Cost", "Cost & Financial Metrics", "S8_Financial", "F&D Cost = Total Capex / Reserve Additions", ["Total Capex ($M)", "Reserve Additions (MMboe)"], ["Total Capex ($M)", "Reserve Additions (MMboe)", "F&D Cost ($/BOE)"], "$M/MMboe equals $/BOE.", "$/BOE", "currency", { lowerIsBetter: true }),
  d("recycle_ratio", "Recycle Ratio", "Cost & Financial Metrics", "S8_Financial", "Recycle Ratio = Netback / F&D Cost", ["Netback ($/BOE)", "F&D Cost ($/BOE)"], ["Netback ($/BOE)", "F&D Cost ($/BOE)", "Recycle Ratio (x)"], "Financial sheet inputs are used.", "x", "ratio"),

  d("dc_per_ft", "Drilling Cost per Foot", "Drilling & Completions", "S5_Drilling", "DC/ft = Total Drilling Cost / Total Footage", ["Total Drilling Cost ($M)", "Total Footage Drilled (ft)"], ["Total Drilling Cost ($M)", "Total Footage Drilled (ft)", "DC/ft ($/ft)"], "Cost is converted from $M to dollars.", "$/ft", "currency", { lowerIsBetter: true }),
  d("rop", "Rate of Penetration", "Drilling & Completions", "S5_Drilling", "ROP = Footage Drilled / Drilling Time", ["Footage Drilled (ft)", "Drilling Time (hrs)"], ["Footage Drilled (ft)", "Drilling Time (hrs)", "ROP (ft/hr)"], "Aggregate annual company metrics are used.", "ft/hr"),
  d("npt_rate", "NPT Rate", "Drilling & Completions", "S5_Drilling", "NPT (%) = NPT Hours / Total Rig Hours x 100", ["NPT Hours", "Total Rig Hours"], ["NPT Hours", "Total Rig Hours", "NPT Rate (%)"], "Rig program level calculation.", "%", "percent", { lowerIsBetter: true }),
  d("afe_variance", "AFE Variance", "Drilling & Completions", "S5_Drilling", "AFE Variance (%) = (Actual Cost - AFE) / AFE x 100", ["Actual Well Cost ($M)", "AFE Budget ($M)"], ["Actual Well Cost ($M)", "AFE Budget ($M)", "AFE Variance (%)"], "Costs are both $M.", "%", "percent", { lowerIsBetter: true }),

  d("trir", "TRIR", "HSE / ESG", "S6_HSE", "TRIR = Recordable Incidents x 200,000 / Man-Hours Worked", ["Recordable Incidents", "Man-Hours Worked"], ["Recordable Incidents", "Man-Hours Worked", "TRIR"], "OSHA 200,000 hour basis is used.", "rate", "ratio", { lowerIsBetter: true }),
  d("ltif", "LTIF", "HSE / ESG", "S6_HSE", "LTIF = LTIs x 1,000,000 / Man-Hours Worked", ["Lost Time Injuries (LTIs)", "Man-Hours Worked"], ["Lost Time Injuries (LTIs)", "Man-Hours Worked", "LTIF (per MMhrs)"], "Million-hour basis is used.", "per MMhrs", "ratio", { lowerIsBetter: true }),
  d("spill_recovery_rate", "Spill Recovery Rate", "HSE / ESG", "S6_HSE", "Spill Recovery Rate (%) = Volume Recovered / Volume Released x 100", ["Spills Recovered (bbl)", "Spills Volume (bbl)"], ["Spills Recovered (bbl)", "Spills Volume (bbl)", "Spill Recovery Rate (%)"], "Spills volume is treated as released volume.", "%", "percent"),
  d("flaring_intensity", "Flaring Intensity", "HSE / ESG", "S6_HSE", "Flaring Intensity = Total Gas Flared / Total Production", ["Gas Flared Daily (mmscfd)", "Total Production (MMboe)"], ["Gas Flared Daily (mmscfd)", "Total Production (MMboe)", "Flaring Intensity (scf/BOE)"], "Daily flare rate is annualized.", "scf/BOE", "number", { lowerIsBetter: true }),
  d("ghg_intensity", "GHG Intensity", "HSE / ESG", "S9_ESG_Environmental", "GHG Intensity = Scope 1 Emissions x 1000 / Production", ["Total Scope 1 Emissions (ktCO2e)", "Total Production (MMboe)"], ["Total Scope 1 Emissions (ktCO2e)", "Total Production (MMboe)", "GHG Intensity (kgCO2e/BOE)"], "ktCO2e and MMboe are converted.", "kgCO2e/BOE", "number", { lowerIsBetter: true }),
  d("methane_intensity", "Methane Intensity", "HSE / ESG", "S9_ESG_Environmental", "Methane Intensity (%) = Methane Emitted / Methane Produced x 100", ["CH4 Emitted (kt CH4)", "Total Gas Produced (MMscf)"], ["CH4 Emitted (kt CH4)", "Total Gas Produced (MMscf)", "Methane Intensity (%)"], "MMscf gas is converted to tonnes CH4 equivalent.", "%", "percent", { lowerIsBetter: true }),
  d("produced_water_reinjection_rate", "Produced Water Re-injection Rate", "HSE / ESG", "S9_ESG_Environmental", "Re-injection Rate = Re-injected Volume / Produced Water x 100", ["Produced Water Re-injected (MM bbl)", "Produced Water (MM bbl)"], ["Produced Water Re-injected (MM bbl)", "Produced Water (MM bbl)", "Produced Water Re-injection Rate (%)"], "Both inputs are million barrels.", "%", "percent"),
  d("gas_capture_rate", "Gas Capture Rate", "HSE / ESG", "S9_ESG_Environmental", "Gas Capture Rate (%) = Gas Utilized / Total Gas Produced x 100", ["Gas Utilized (mmscfd)", "Total Gas Produced (mmscfd)"], ["Gas Utilized (mmscfd)", "Total Gas Produced (mmscfd)", "Gas Capture Rate (%)"], "Formula result is retained even above 100% in dummy data.", "%", "percent"),

  d("corrosion_rate", "Corrosion Rate", "Asset Integrity", "S7_Asset_Integrity", "Corrosion Rate = (Initial Thickness - Current Thickness) / Time", ["Initial Wall Thickness (mm)", "Current Wall Thickness (mm)", "Years of Measurement"], ["Initial Wall Thickness (mm)", "Current Wall Thickness (mm)", "Years of Measurement", "Corrosion Rate (mm/yr)"], "Wall thickness values are aggregates.", "mm/yr", "number", { lowerIsBetter: true }),
  d("sce_compliance", "SCE Compliance Rate", "Asset Integrity", "S7_Asset_Integrity", "SCE Compliance Rate (%) = Tested & Passed / Due for Test x 100", ["SCE Items Tested & Passed", "SCE Items Due for Test"], ["SCE Items Tested & Passed", "SCE Items Due for Test", "SCE Compliance Rate (%)"], "Due count is the denominator.", "%", "percent"),
  d("inspection_compliance", "Inspection Compliance", "Asset Integrity", "S7_Asset_Integrity", "Inspection Compliance (%) = Completed / Due x 100", ["Inspections Completed", "Inspections Due"], ["Inspections Completed", "Inspections Due", "Inspection Compliance (%)"], "Completed is treated as completed on time.", "%", "percent")
];

export const COMPUTABLE_KPIS = KPI_DEFINITIONS;
