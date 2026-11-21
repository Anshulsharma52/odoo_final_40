/**
 * Predefined Bill of Materials (BOM) & Quotation Templates for 1kW - 5kW Systems
 * Supports both On-Grid and Off-Grid solar packages as defined by SunPower Solutions.
 */

const PACKAGE_TEMPLATES = {
  '1kW_on-grid': {
    capacityKw: 1,
    systemType: 'On-Grid',
    title: '1 kW On-Grid Solar System',
    basePrice: 65000,
    subsidyAmount: 18000,
    items: [
      { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 2, unitPrice: 15000, serialRequired: true },
      { name: '1 kW Grid-Tie Solar Inverter', category: 'Inverter', quantity: 1, unitPrice: 20000, serialRequired: true },
      { name: 'GI Rooftop Mounting Structure (2 panels)', category: 'Structure/Stand', quantity: 1, unitPrice: 4000, serialRequired: false },
      { name: '4 sqmm Solar DC Cable (Meters)', category: 'Wire/Cable', quantity: 25, unitPrice: 80, serialRequired: false },
      { name: 'AC/DC Distribution Box & MC4 Connectors', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 3500, serialRequired: false },
      { name: 'Chemical Earthing Kit & Copper Rods', category: 'Switchgear/Earthing', quantity: 2, unitPrice: 2500, serialRequired: false },
      { name: 'Installation & Testing Service', category: 'Installation/Service', quantity: 1, unitPrice: 5500, serialRequired: false }
    ]
  },
  '3kW_on-grid': {
    capacityKw: 3,
    systemType: 'On-Grid',
    title: '3 kW On-Grid Solar System (Most Popular)',
    basePrice: 165000,
    subsidyAmount: 45000,
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

function getTemplate(capacityKw, systemType = 'On-Grid') {
  const normType = (systemType || 'On-Grid').toLowerCase().includes('off') ? 'off-grid' : 'on-grid';
  const key = `${capacityKw}kW_${normType}`;
  return PACKAGE_TEMPLATES[key] || PACKAGE_TEMPLATES['3kW_on-grid'];
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
  getTemplate,
  generateBOM
};
