import { describe, expect, it } from 'vitest';
import { filterRegions, getRegion, regionWorks } from '@/lib/regions';

describe('regional catalog', () => {
  it('shows only the three Cuetzalan works on its microsite', () => {
    const region = getRegion('cuetzalan');
    expect(region).toBeDefined();
    if (!region) throw new Error('Missing Cuetzalan');
    expect(regionWorks(region).map(piece => piece.id)).toEqual(['TK-0701', 'TK-0702', 'TK-0703']);
  });
  it('routes Acatlán to the Tecuani rather than neighboring works', () => {
    const region = getRegion('acatlan');
    if (!region) throw new Error('Missing Acatlán');
    expect(regionWorks(region).map(piece => piece.id)).toEqual(['TK-0512']);
  });
  it('combines state, craft and accent-insensitive community search', () => {
    expect(filterRegions('cuetzalan', 'Puebla', ['Cestería']).map(region => region.id)).toEqual(['cuetzalan']);
    expect(filterRegions('acatlan', 'Puebla', ['Textil'])).toEqual([]);
    expect(filterRegions('olinala', 'all', ['Laca']).map(region => region.id)).toEqual(['olinala']);
  });
  it('rejects unknown region IDs', () => { expect(getRegion('not-a-region')).toBeUndefined(); });
});