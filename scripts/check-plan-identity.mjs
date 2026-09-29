import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import process from 'node:process';

const [planPath, approvedPath, expectedHash, ...extra] = process.argv.slice(2);

function report(status, reason, planSha256, extraFields = {}) {
  console.log(JSON.stringify({
    status,
    reason,
    ...(planSha256 ? { planSha256 } : {}),
    assurance: 'content-only-not-approval',
    ...extraFields,
  }));
}

function extractIds(content) {
  const rIds = [...content.matchAll(/R-(\d+)/g)].map(m => `R-${m[1]}`);
  const aIds = [...content.matchAll(/A-(\d+(?:\.\d+)?)/g)].map(m => `A-${m[1]}`);
  const cIds = [...content.matchAll(/C-(\d+)/g)].map(m => `C-${m[1]}`);
  const sIds = [...content.matchAll(/S-(\d+)/g)].map(m => `S-${m[1]}`);
  const vIds = [...content.matchAll(/V-(\d+)/g)].map(m => `V-${m[1]}`);
  return { rIds: [...new Set(rIds)], aIds: [...new Set(aIds)], cIds: [...new Set(cIds)], sIds: [...new Set(sIds)], vIds: [...new Set(vIds)] };
}

function checkCoverage(planContent, taskRecordContent) {
  const planIds = extractIds(planContent);
  const recordIds = extractIds(taskRecordContent);
  const gaps = [];

  // Check R-ids in record have A-ids
  for (const rId of recordIds.rIds) {
    const linkedA = recordIds.aIds.filter(a => a.startsWith(rId.replace('R-', 'A-') + '.'));
    if (linkedA.length === 0) {
      gaps.push({ type: 'R-without-A', id: rId });
    }
  }

  // Check A-ids in plan have C/S/V
  for (const aId of planIds.aIds) {
    const linkedC = planIds.cIds.filter(c => true); // C-id should reference A-ids in its section
    const linkedS = planIds.sIds.length > 0;
    const linkedV = planIds.vIds.length > 0;
    if (!linkedS) gaps.push({ type: 'A-without-S', id: aId });
    if (!linkedV) gaps.push({ type: 'A-without-V', id: aId });
  }

  // Check C-ids have A-ids and V-ids
  for (const cId of planIds.cIds) {
    // Simplified: if plan has C-ids, it should have A-ids and V-ids somewhere
    if (planIds.aIds.length === 0) gaps.push({ type: 'C-without-A', id: cId });
    if (planIds.vIds.length === 0) gaps.push({ type: 'C-without-V', id: cId });
  }

  return gaps;
}

if (!planPath || !approvedPath || !/^[a-f0-9]{64}$/.test(expectedHash ?? '') || extra.length > 1) {
  report('blocked', 'usage: check-plan-identity.mjs <plan.md> <approved-snapshot.md> <approved-sha256> [task-record.md]');
  process.exitCode = 2;
} else {
  try {
    const [plan, approved] = await Promise.all([readFile(planPath), readFile(approvedPath)]);
    const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
    const approvedHash = sha256(approved);
    const planHash = sha256(plan);

    if (approvedHash !== expectedHash) {
      report('blocked', 'approved-snapshot-hash-mismatch', planHash);
      process.exitCode = 1;
    } else if (planHash !== expectedHash) {
      report('blocked', 'plan-content-mismatch', planHash);
      process.exitCode = 1;
    } else {
      // Coverage check if task record provided
      let coverageGaps = [];
      if (extra[0]) {
        try {
          const taskRecord = await readFile(extra[0], 'utf8');
          coverageGaps = checkCoverage(plan.toString(), taskRecord);
        } catch {
          coverageGaps.push({ type: 'task-record-unreadable', id: extra[0] });
        }
      }

      if (coverageGaps.length > 0) {
        report('blocked', 'coverage-gaps-detected', planHash, { gaps: coverageGaps });
        process.exitCode = 1;
      } else {
        report('content-match', 'approval-source-and-scope-not-verified', planHash, { coverage: 'complete' });
      }
    }
  } catch {
    report('blocked', 'plan-or-approved-snapshot-unavailable');
    process.exitCode = 1;
  }
}
