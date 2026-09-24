export const BOTTOM_NAV_HEIGHT = 84;

export function createBottomNavPath(width: number): string {
  const centerX = width / 2;
  const centerY = 16;
  // The 64px button sits 75% inside the bar. A concentric 40px radius
  // leaves an even 8px gap along its sides and bottom.
  const cradleRadius = 40;
  const shoulderRadius = 8;
  const cornerRadius = 32;

  // Externally tangent circles join the horizontal edge to the cradle
  // without a sharp corner, a straight bridge, or a painted-over surface.
  const centerDistance = cradleRadius + shoulderRadius;
  const shoulderOffset = Math.sqrt(centerDistance ** 2 - (centerY - shoulderRadius) ** 2);
  const tangentOffset = shoulderOffset * cradleRadius / centerDistance;
  const tangentY = centerY + (shoulderRadius - centerY) * cradleRadius / centerDistance;

  return [
    `M ${cornerRadius} 0`,
    `H ${centerX - shoulderOffset}`,
    `A ${shoulderRadius} ${shoulderRadius} 0 0 1 ${centerX - tangentOffset} ${tangentY}`,
    `A ${cradleRadius} ${cradleRadius} 0 1 0 ${centerX + tangentOffset} ${tangentY}`,
    `A ${shoulderRadius} ${shoulderRadius} 0 0 1 ${centerX + shoulderOffset} 0`,
    `H ${width - cornerRadius}`,
    `Q ${width} 0 ${width} ${cornerRadius}`,
    `V ${BOTTOM_NAV_HEIGHT - cornerRadius}`,
    `Q ${width} ${BOTTOM_NAV_HEIGHT} ${width - cornerRadius} ${BOTTOM_NAV_HEIGHT}`,
    `H ${cornerRadius}`,
    `Q 0 ${BOTTOM_NAV_HEIGHT} 0 ${BOTTOM_NAV_HEIGHT - cornerRadius}`,
    `V ${cornerRadius}`,
    `Q 0 0 ${cornerRadius} 0 Z`,
  ].join(" ");
}
