export type CityPosition = { x: number; y: number };
export const CITYSCAPE_LIMIT = 8;

export function constrainCityPosition(position: CityPosition): CityPosition {
  return {
    x: Math.max(-CITYSCAPE_LIMIT, Math.min(CITYSCAPE_LIMIT, Math.round(position.x))),
    y: Math.max(-CITYSCAPE_LIMIT, Math.min(CITYSCAPE_LIMIT, Math.round(position.y))),
  };
}

export function moveCityPosition(position: CityPosition, delta: CityPosition): CityPosition {
  return constrainCityPosition({ x: position.x + delta.x, y: position.y + delta.y });
}
