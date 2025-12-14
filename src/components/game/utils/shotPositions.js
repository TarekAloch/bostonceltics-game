/**
 * Shot Position Utilities
 *
 * Helper functions to calculate shot positions for the ShotArc component
 * based on shot type and player position.
 *
 * Coordinate system: SVG viewBox 0 0 400 200
 * - Left basket: x=25, y=100
 * - Right basket: x=375, y=100
 */

export const BASKET_POSITIONS = {
  left: { x: 25, y: 100 },
  right: { x: 375, y: 100 }
}

// Common shooting positions on the court
export const SHOT_POSITIONS = {
  // Celtics offense (right side)
  celtics: {
    'three-point-top': { x: 280, y: 100 },
    'three-point-wing-top': { x: 300, y: 75 },
    'three-point-wing-bottom': { x: 300, y: 125 },
    'three-point-corner-top': { x: 360, y: 65 },
    'three-point-corner-bottom': { x: 360, y: 135 },
    'mid-range-top': { x: 310, y: 100 },
    'mid-range-elbow-top': { x: 330, y: 80 },
    'mid-range-elbow-bottom': { x: 330, y: 120 },
    'layup-right': { x: 365, y: 100 },
    'layup-left': { x: 365, y: 90 },
    'paint': { x: 345, y: 100 },
  },
  // Lakers offense (left side)
  lakers: {
    'three-point-top': { x: 120, y: 100 },
    'three-point-wing-top': { x: 100, y: 75 },
    'three-point-wing-bottom': { x: 100, y: 125 },
    'three-point-corner-top': { x: 40, y: 65 },
    'three-point-corner-bottom': { x: 40, y: 135 },
    'mid-range-top': { x: 90, y: 100 },
    'mid-range-elbow-top': { x: 70, y: 80 },
    'mid-range-elbow-bottom': { x: 70, y: 120 },
    'layup-left': { x: 35, y: 100 },
    'layup-right': { x: 35, y: 110 },
    'paint': { x: 55, y: 100 },
  }
}

/**
 * Get the basket position for a team
 * @param {string} team - 'celtics' or 'lakers'
 * @param {string} possession - Which team has the ball
 * @returns {object} { x, y } coordinates
 */
export function getBasketPosition(team, possession) {
  // Celtics shoot at right basket when they have possession
  // Lakers shoot at left basket when they have possession
  if (possession === 'celtics') {
    return BASKET_POSITIONS.right
  } else {
    return BASKET_POSITIONS.left
  }
}

/**
 * Get a shooting position based on shot type and team
 * @param {string} shotType - 'three-point', 'mid-range', 'layup', etc.
 * @param {string} team - 'celtics' or 'lakers'
 * @param {string} position - Optional specific position (e.g., 'wing-top', 'corner-bottom')
 * @returns {object} { x, y } coordinates
 */
export function getShootingPosition(shotType, team, position = null) {
  const teamPositions = SHOT_POSITIONS[team]

  if (position) {
    // Specific position requested
    const key = `${shotType}-${position}`
    return teamPositions[key] || teamPositions[shotType] || { x: 200, y: 100 }
  }

  // Random position for shot type
  const matchingPositions = Object.keys(teamPositions)
    .filter(key => key.startsWith(shotType))
    .map(key => teamPositions[key])

  if (matchingPositions.length === 0) {
    // Fallback to center
    return { x: 200, y: 100 }
  }

  // Return random matching position
  return matchingPositions[Math.floor(Math.random() * matchingPositions.length)]
}

/**
 * Determine shot type from distance to basket
 * @param {object} from - Shooting position { x, y }
 * @param {object} to - Basket position { x, y }
 * @returns {string} 'three-point', 'mid-range', or 'layup'
 */
export function determineShotType(from, to) {
  const distance = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
  )

  // Distances are approximate based on our court scale
  if (distance < 30) return 'layup'
  if (distance < 70) return 'mid-range'
  return 'three-point'
}

/**
 * Create shot data for the ShotArc component
 * @param {object} params - Shot parameters
 * @param {string} params.team - 'celtics' or 'lakers'
 * @param {string} params.possession - Which team has the ball
 * @param {string} params.shotType - Type of shot
 * @param {string} params.result - 'made', 'missed', or 'blocked'
 * @param {string} params.position - Optional specific position
 * @returns {object} Complete shot data for ShotArc component
 */
export function createShotData({ team, possession, shotType, result, position = null }) {
  const from = getShootingPosition(shotType, team, position)
  const to = getBasketPosition(team, possession)

  return {
    from,
    to,
    shotType,
    result
  }
}

/**
 * Get points for a shot type
 * @param {string} shotType - Type of shot
 * @returns {number} Points value (1, 2, or 3)
 */
export function getShotPoints(shotType) {
  if (shotType === 'three-point') return 3
  if (shotType === 'free-throw') return 1
  return 2
}
