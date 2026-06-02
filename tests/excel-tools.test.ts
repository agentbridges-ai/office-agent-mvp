import { describe, expect, it } from 'vitest';
import { executeExcelCall } from '../lib/agent/excel-tools';

describe('Excel tools', () => {
  it('rejects unknown capabilities with structured unsupported result', async () => {
    const result = await executeExcelCall({
      objectName: 'Excel.Range',
      memberName: 'definitelyNotARealMember',
      memberKind: 'method',
    });
    expect(result.ok).toBe(false);
    expect(result.supportLevel).toBe('unsupported');
    expect(result.error).toContain('Unknown Excel capability');
  });

  it('reports registered unsupported mappings without executing them', async () => {
    const result = await executeExcelCall({
      objectName: 'Excel.Binding',
      memberName: 'delete',
      memberKind: 'method',
    });
    expect(result.ok).toBe(false);
    expect(result.supportLevel).toBe('unsupported');
    expect(result.error).toContain('phase 1');
  });
});

