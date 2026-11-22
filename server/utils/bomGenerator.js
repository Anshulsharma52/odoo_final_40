/**
 * Predefined Bill of Materials (BOM) & Quotation Templates for 1kW - 10kW Systems
 * Supports both On-Grid and Off-Grid solar packages as defined by SunPower Solutions.
 * Accurately implements variable DBT Subsidy according to PM Surya Ghar guidelines:
 * - 1 kW: ₹30,000
 * - 2 kW: ₹60,000
 * - 3 kW and above: ₹78,000 (maximum residential DBT cap)
 * - Off-grid: ₹0 (customizable by sales)
 */

const PACKAGE_TEMPLATES = {
  '1kW_on-grid': {
    capacityKw: 1,
    systemType: 'On-Grid',
    title: '1 kW On-Grid Solar System',
    basePrice: 65000,
    subsidyAmount: 30000,
    items: [
      { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 2, unitPrice: 15000, serialRequired: true },
      { name: '1 kW Grid-Tie Solar Inverter', category: 'Inverter', quantity: 1, unitPrice: 18000, serialRequired: true },
      { name: 'GI Rooftop Mounting Structure (2 panels)', category: 'Structure/Stand', quantity: 1, unitPrice: 4000, serialRequired: false },
      { name: '4 sqmm Solar DC Cable (Meters)', category: 'Wire/Cable', quantity: 25, unitPrice: 80, serialRequired: false },
      { name: 'AC/DC Distribution Box & MC4 Connectors', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 3500, serialRequired: false },
      { name: 'Chemical Earthing Kit & Copper Rods', category: 'Switchgear/Earthing', quantity: 2, unitPrice: 2000, serialRequired: false },
      { name: 'Installation & Testing Service', category: 'Installation/Service', quantity: 1, unitPrice: 3500, serialRequired: false }
    ]
  },
  '2kW_on-grid': {
    capacityKw: 2,
    systemType: 'On-Grid',
    title: '2 kW On-Grid Solar System',
    basePrice: 120000,
    subsidyAmount: 60000,
    items: [
      { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 4, unitPrice: 15000, serialRequired: true },
      { name: '2 kW Grid-Tie Smart Solar Inverter', category: 'Inverter', quantity: 1, unitPrice: 28000, serialRequired: true },
      { name: 'Hot-Dip Galvanized Mounting Stand (4 panels)', category: 'Structure/Stand', quantity: 1, unitPrice: 8000, serialRequired: false },
      { name: '4 sqmm UV Protected DC Cable (Meters)', category: 'Wire/Cable', quantity: 40, unitPrice: 85, serialRequired: false },
      { name: 'IP65 AC/DC Distribution Box with SPD', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 5000, serialRequired: false },
      { name: 'Double Safety Chemical Earthing Kit', category: 'Switchgear/Earthing', quantity: 2, unitPrice: 2500, serialRequired: false },
      { name: 'Turnkey Installation & Net-Metering Service', category: 'Installation/Service', quantity: 1, unitPrice: 8000, serialRequired: false }
    ]
  },
  '3kW_on-grid': {
    capacityKw: 3,
    systemType: 'On-Grid',
    title: '3 kW On-Grid Solar System (Most Popular)',
    basePrice: 165000,
    subsidyAmount: 78000,
    items: [
      { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 6, unitPrice: 15000, serialRequired: true },
      { name: '3 kW Grid-Tie Smart Solar Inverter', category: 'Inverter', quantity: 1, unitPrice: 38000, serialRequired: true },
      { name: 'Hot-Dip Galvanized Mounting Stand (6 panels)', category: 'Structure/Stand', quantity: 1, unitPrice: 12000, serialRequired: false },
      { name: '4/6 sqmm UV Protected DC Cable (Meters)', category: 'Wire/Cable', quantity: 50, unitPrice: 90, serialRequired: false },
      { name: 'IP65 AC/DC Distribution Box with SPD', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 6500, serialRequired: false },
      { name: 'Double Safety Earthing & Lightning Arrester', category: 'Switchgear/Earthing', quantity: 3, unitPrice: 3000, serialRequired: false },
      { name: 'Turnkey Installation & Grid Sync Service', category: 'Installation/Service', quantity: 1, unitPrice: 11000, serialRequired: false }
    ]
  },
  '4kW_on-grid': {
    capacityKw: 4,
    systemType: 'On-Grid',
    title: '4 kW On-Grid Solar System',
    basePrice: 215000,
    subsidyAmount: 78000,
    items: [
      { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 8, unitPrice: 15000, serialRequired: true },
      { name: '4 kW Dual-MPPT Grid-Tie Inverter', category: 'Inverter', quantity: 1, unitPrice: 45000, serialRequired: true },
      { name: 'Elevated HDG Mounting Structure (8 panels)', category: 'Structure/Stand', quantity: 1, unitPrice: 16000, serialRequired: false },
      { name: '6 sqmm Solar Copper DC Cable (Meters)', category: 'Wire/Cable', quantity: 65, unitPrice: 100, serialRequired: false },
      { name: 'IP65 AC/DC Distribution Box with SPD', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 8000, serialRequired: false },
      { name: 'Triple Chemical Earthing & Lightning Arrester', category: 'Switchgear/Earthing', quantity: 3, unitPrice: 3000, serialRequired: false },
      { name: 'Turnkey Installation & Discom Liaison', category: 'Installation/Service', quantity: 1, unitPrice: 13500, serialRequired: false }
    ]
  },
  '5kW_on-grid': {
    capacityKw: 5,
    systemType: 'On-Grid',
    title: '5 kW On-Grid Commercial/High-Load Solar System',
    basePrice: 260000,
    subsidyAmount: 78000,
    items: [
      { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 10, unitPrice: 15000, serialRequired: true },
      { name: '5 kW Dual-MPPT Grid-Tie Inverter', category: 'Inverter', quantity: 1, unitPrice: 52000, serialRequired: true },
      { name: 'Heavy Duty Elevated HDG Mounting Structure', category: 'Structure/Stand', quantity: 1, unitPrice: 22000, serialRequired: false },
      { name: '6 sqmm Solar Copper DC Cable (Meters)', category: 'Wire/Cable', quantity: 80, unitPrice: 110, serialRequired: false },
      { name: 'Industrial Grade AC/DC Combiner Box', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 10000, serialRequired: false },
      { name: 'Triple Chemical Earthing + ESE Lightning Arrester', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 12000, serialRequired: false },
      { name: 'Complete Installation, Liaison & Testing', category: 'Installation/Service', quantity: 1, unitPrice: 15200, serialRequired: false }
    ]
  },
  '10kW_on-grid': {
    capacityKw: 10,
    systemType: 'On-Grid',
    title: '10 kW High-Yield Commercial On-Grid System',
    basePrice: 480000,
    subsidyAmount: 78000,
    items: [
      { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 20, unitPrice: 14500, serialRequired: true },
      { name: '10 kW Three-Phase Commercial Grid Inverter', category: 'Inverter', quantity: 1, unitPrice: 95000, serialRequired: true },
      { name: 'Elevated High-Wind HDG Structure (20 panels)', category: 'Structure/Stand', quantity: 1, unitPrice: 42000, serialRequired: false },
      { name: '10 sqmm Armoured DC Cable (Meters)', category: 'Wire/Cable', quantity: 120, unitPrice: 140, serialRequired: false },
      { name: 'Heavy Commercial AC/DC Protection Panel', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 18000, serialRequired: false },
      { name: '4-Rod Chemical Earthing + Advanced ESE Arrester', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 16000, serialRequired: false },
      { name: 'Engineering Liaison & Grid Sync Certification', category: 'Installation/Service', quantity: 1, unitPrice: 22200, serialRequired: false }
    ]
  },
  '3kW_off-grid': {
    capacityKw: 3,
    systemType: 'Off-Grid',
    title: '3 kW Off-Grid Solar System with Battery Backup',
    basePrice: 225000,
    subsidyAmount: 0,
    items: [
      { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 6, unitPrice: 15000, serialRequired: true },
      { name: '3.5 kVA Pure Sine Wave Off-Grid Inverter', category: 'Inverter', quantity: 1, unitPrice: 42000, serialRequired: true },
      { name: '150Ah Solar Tubular C10 Deep Cycle Battery', category: 'Battery', quantity: 2, unitPrice: 16500, serialRequired: true },
      { name: 'Hot-Dip Galvanized Mounting Stand', category: 'Structure/Stand', quantity: 1, unitPrice: 12000, serialRequired: false },
      { name: 'Solar DC & Battery Interconnect Cables', category: 'Wire/Cable', quantity: 50, unitPrice: 100, serialRequired: false },
      { name: 'Distribution Box with DC Circuit Breakers', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 7500, serialRequired: false },
      { name: 'Complete Installation & Backup Testing', category: 'Installation/Service', quantity: 1, unitPrice: 12500, serialRequired: false }
    ]
  },
  '5kW_off-grid': {
    capacityKw: 5,
    systemType: 'Off-Grid',
    title: '5 kW Off-Grid Heavy Duty Solar System with 4-Battery Bank',
    basePrice: 350000,
    subsidyAmount: 0,
    items: [
      { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 10, unitPrice: 15000, serialRequired: true },
      { name: '5 kVA Heavy Duty Hybrid Off-Grid Inverter', category: 'Inverter', quantity: 1, unitPrice: 58000, serialRequired: true },
      { name: '150Ah Solar Tubular C10 Deep Cycle Battery', category: 'Battery', quantity: 4, unitPrice: 16500, serialRequired: true },
      { name: 'Heavy Duty Elevated HDG Mounting Structure', category: 'Structure/Stand', quantity: 1, unitPrice: 22000, serialRequired: false },
      { name: 'High-Current Battery Rack & Interconnects', category: 'Structure/Stand', quantity: 1, unitPrice: 8500, serialRequired: false },
      { name: 'Solar Cables & Industrial DC Breaker Box', category: 'Wire/Cable', quantity: 1, unitPrice: 14500, serialRequired: false },
      { name: 'Complete Turnkey Installation & Testing', category: 'Installation/Service', quantity: 1, unitPrice: 18000, serialRequired: false }
    ]
  }
};

/**
 * Calculates standard variable subsidy based on kW package and system type
 */
function getStandardSubsidy(capacityKw, systemType = 'On-Grid') {
  const normType = (systemType || 'On-Grid').toLowerCase();
  if (normType.includes('off')) return 0;
  const kw = Number(capacityKw) || 1;
  if (kw <= 1) return 30000;
  if (kw <= 2) return 60000;
  return 78000; // 3kW and above capped at 78,000 in India PM Surya Ghar
}

function getTemplate(capacityKw, systemType = 'On-Grid') {
  const normType = (systemType || 'On-Grid').toLowerCase().includes('off') ? 'off-grid' : 'on-grid';
  const key = `${capacityKw}kW_${normType}`;
  if (PACKAGE_TEMPLATES[key]) {
    return PACKAGE_TEMPLATES[key];
  }

  // Dynamic fallback scaling for arbitrary capacities (e.g. 6kW, 8kW, 15kW)
  const kw = Number(capacityKw) || 3;
  const panelsCount = Math.max(2, Math.ceil((kw * 1000) / 540));
  const subsidyAmount = getStandardSubsidy(kw, systemType);

  return {
    capacityKw: kw,
    systemType: normType === 'off-grid' ? 'Off-Grid' : 'On-Grid',
    title: `${kw} kW ${normType === 'off-grid' ? 'Off-Grid' : 'On-Grid'} Solar Package`,
    subsidyAmount,
    items: [
      { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: panelsCount, unitPrice: 15000, serialRequired: true },
      { name: `${kw} kW Solar Inverter`, category: 'Inverter', quantity: 1, unitPrice: kw * 10500, serialRequired: true },
      { name: `HDG Mounting Structure (${panelsCount} panels)`, category: 'Structure/Stand', quantity: 1, unitPrice: panelsCount * 2200, serialRequired: false },
      { name: 'UV Protected Solar DC Cable (Meters)', category: 'Wire/Cable', quantity: kw * 16, unitPrice: 95, serialRequired: false },
      { name: 'IP65 AC/DC Distribution Box', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 7000, serialRequired: false },
      { name: 'Chemical Earthing & Safety Arresters', category: 'Switchgear/Earthing', quantity: 3, unitPrice: 3000, serialRequired: false },
      { name: 'Turnkey Installation & Commissioning', category: 'Installation/Service', quantity: 1, unitPrice: kw * 3000, serialRequired: false }
    ]
  };
}

function generateBOM(capacityKw, systemType) {
  const template = getTemplate(capacityKw, systemType);
  return template.items.map(it => ({
    name: it.name,
    category: it.category,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    total: it.quantity * it.unitPrice,
    serialRequired: it.serialRequired,
    allocatedSerials: []
  }));
}

module.exports = {
  PACKAGE_TEMPLATES,
  getStandardSubsidy,
  getTemplate,
  generateBOM
};
