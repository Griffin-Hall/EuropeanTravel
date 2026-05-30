/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { cities, travelTimes, travelTimesSupplemental, legDurations,
        getTravelTime, getLegOptions, getFastestLegOption, parseDurationToHours } =
  require('../data.js');

function isFiniteNumber(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

function safePickTravelInfo(info) {
  if (!info) return null;
  return {
    from: info.from,
    to: info.to,
    flight: info.flight ?? null,
    train: info.train ?? null,
    flightHours: isFiniteNumber(info.flightHours) ? info.flightHours : null,
    trainHours: isFiniteNumber(info.trainHours) ? info.trainHours : null,
  };
}

function main() {
  const cityNames = Object.keys(cities);

  const missingByCity = {};
  const missingDetails = [];

  let totalPairs = 0;
  let missingPairs = 0;

  for (const from of cityNames) {
    for (const to of cityNames) {
      if (from === to) continue;
      totalPairs += 1;

      const fastest = getFastestLegOption(from, to);
      if (fastest) continue;

      missingPairs += 1;

      const info = getTravelTime(from, to);
      const legKey = `${from}-${to}`;
      const legKeyReverse = `${to}-${from}`;
      const legLabel = legDurations[legKey] ?? legDurations[legKeyReverse] ?? null;

      const hasInfo = !!info;
      const hasLegLabel = !!legLabel;

      let reason = 'missing in both travelTimes and legDurations';
      if (hasInfo && !hasLegLabel) reason = 'travelTimes exists but has no numeric/parseable duration';
      else if (!hasInfo && hasLegLabel) reason = 'legDurations exists but has no numeric/parseable duration';
      else if (hasInfo && hasLegLabel) reason = 'both exist but neither yields numeric/parseable duration';

      if (hasInfo) {
        const flightHours =
          isFiniteNumber(info.flightHours) ? info.flightHours : parseDurationToHours(info.flight);
        const trainHours =
          isFiniteNumber(info.trainHours) ? info.trainHours : parseDurationToHours(info.train);

        if (isFiniteNumber(flightHours) || isFiniteNumber(trainHours)) {
          // getFastestLegOption still failed; keep generic reason.
        }
      }

      if (!missingByCity[from]) missingByCity[from] = [];
      missingByCity[from].push(to);

      missingDetails.push({
        from,
        to,
        reason,
        travelTime: safePickTravelInfo(info),
        legDurationLabel: legLabel,
      });
    }
  }

  for (const k of Object.keys(missingByCity)) missingByCity[k].sort((a, b) => a.localeCompare(b));

  missingDetails.sort((a, b) => {
    const c1 = a.from.localeCompare(b.from);
    if (c1 !== 0) return c1;
    return a.to.localeCompare(b.to);
  });

  const out = {
    generatedAt: new Date().toISOString(),
    source: 'data.js',
    cityCount: cityNames.length,
    totalDirectedPairs: totalPairs,
    missingDirectedPairs: missingPairs,
    missingByCity,
    missingDetails,
  };

  const outPath = path.join(ROOT, 'missing-routes-report.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

  const lines = [];
  lines.push(`Generated: ${out.generatedAt}`);
  lines.push(`Cities: ${out.cityCount}`);
  lines.push(`Pairs checked (directed): ${out.totalDirectedPairs}`);
  lines.push(`Missing pairs (directed): ${out.missingDirectedPairs}`);
  lines.push('');
  for (const from of Object.keys(out.missingByCity).sort((a, b) => a.localeCompare(b))) {
    const tos = out.missingByCity[from];
    lines.push(`${from}: ${tos.join(', ')}`);
  }
  const outTxtPath = path.join(ROOT, 'missing-routes-by-city.txt');
  fs.writeFileSync(outTxtPath, lines.join('\n'), 'utf8');

  console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
  console.log(`Wrote ${path.relative(process.cwd(), outTxtPath)}`);
  console.log(`Cities: ${cityNames.length}`);
  console.log(`Pairs checked (directed): ${totalPairs}`);
  console.log(`Missing pairs (directed): ${missingPairs}`);
}

main();
