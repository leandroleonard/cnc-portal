import type { Province, CooperativeSummary } from '@/types/domain';

export type MapViewport = { latitude: number; longitude: number; zoom: number };

export interface MapProvider {
  readonly name: string;
  renderProvinceMap(input: { provinces: Province[]; selectedCode?: string }): React.ReactNode;
  renderCooperativeMap(input: { cooperative: CooperativeSummary; viewport?: MapViewport }): React.ReactNode;
}

/**
 * The public portal currently uses the bundled, attributed 21-province map image as its
 * no-token fallback. A provider can implement this interface when the CNC chooses a live
 * map service; API coordinates and summaries remain provider-independent.
 */
export const mapProviderConfiguration = {
  activeProvider: 'static-angola-map' as const,
  supportsCoordinates: true,
  supportsProvinceCounts: true,
};
