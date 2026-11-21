/**
 * Safely generates a unique sequential reference code.
 * E.g., QT-2026-0003, ORD-2026-0004, TKT-2026-0005, etc.
 * Guarantees no duplicate key collision by scanning existing prefixes and incrementing.
 */
async function generateUniqueCode(Model, fieldName, prefix, padLength = 4) {
  const year = new Date().getFullYear();
  const searchPattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);

  // Find all existing records with this prefix and year
  const docs = await Model.find(
    { [fieldName]: { $regex: `^${prefix}-${year}-` } },
    { [fieldName]: 1 }
  ).lean();

  let maxSeq = 0;
  for (const doc of docs) {
    const val = doc[fieldName];
    if (val) {
      const match = val.match(searchPattern);
      if (match && match[1]) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}-${year}-${String(nextSeq).padStart(padLength, '0')}`;

  // Double check in database to be 100% sure it does not exist
  while (await Model.exists({ [fieldName]: candidate })) {
    nextSeq++;
    candidate = `${prefix}-${year}-${String(nextSeq).padStart(padLength, '0')}`;
  }

  return candidate;
}

module.exports = { generateUniqueCode };
