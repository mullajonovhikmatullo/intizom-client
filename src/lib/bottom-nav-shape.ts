export const BOTTOM_NAV_HEIGHT = 84;

export function createBottomNavPath(width: number): string {
  const centerX = width / 2;
  const centerY = 16;
  // The 64px button sits 75% inside the bar. A concentric 40px radius
  // leaves an even 8px gap along its sides and bottom.
  const cradleRadius = 40;
  const shoulderRadius = 8;
  // 1.5x the app radius (--radius, 8px): the bar is a larger floating surface, and its 8px
  // item pills sit ~4-6px inside it. Circular arcs so corners match CSS border-radius.
  const cornerRadius = 12;

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
    `A ${cornerRadius} ${cornerRadius} 0 0 1 ${width} ${cornerRadius}`,
    `V ${BOTTOM_NAV_HEIGHT - cornerRadius}`,
    `A ${cornerRadius} ${cornerRadius} 0 0 1 ${width - cornerRadius} ${BOTTOM_NAV_HEIGHT}`,
    `H ${cornerRadius}`,
    `A ${cornerRadius} ${cornerRadius} 0 0 1 0 ${BOTTOM_NAV_HEIGHT - cornerRadius}`,
    `V ${cornerRadius}`,
    `A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} 0 Z`,
  ].join(" ");
}
