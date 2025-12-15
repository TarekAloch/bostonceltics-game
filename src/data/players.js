// ============================================
// CURRENT 2024-25 ROSTERS
// ============================================

export const celtics2025 = [
  { name: 'Jayson Tatum', number: 0, position: 'SF', rating: 95 },
  { name: 'Jaylen Brown', number: 7, position: 'SG', rating: 92 },
  { name: 'Derrick White', number: 9, position: 'PG', rating: 85 },
  { name: 'Jrue Holiday', number: 4, position: 'PG', rating: 84 },
  { name: 'Kristaps Porzingis', number: 8, position: 'C', rating: 88 },
  { name: 'Al Horford', number: 42, position: 'C', rating: 78 },
  { name: 'Payton Pritchard', number: 11, position: 'PG', rating: 76 },
  { name: 'Sam Hauser', number: 30, position: 'SF', rating: 72 },
]

export const lakers2025 = [
  { name: 'LeBron James', number: 23, position: 'SF', rating: 92, villain: true },
  { name: 'Anthony Davis', number: 3, position: 'PF', rating: 91, villain: true },
  { name: 'Austin Reaves', number: 15, position: 'SG', rating: 80 },
  { name: "D'Angelo Russell", number: 1, position: 'PG', rating: 79 },
  { name: 'Rui Hachimura', number: 28, position: 'PF', rating: 76 },
  { name: 'Dalton Knecht', number: 4, position: 'SG', rating: 74 },
  { name: 'Gabe Vincent', number: 7, position: 'PG', rating: 72 },
  { name: 'Jaxson Hayes', number: 10, position: 'C', rating: 73 },
]

// ============================================
// ALL-TIME LEGENDS ROSTERS
// ============================================

export const celticsAllTime = [
  { name: 'Bill Russell', number: 6, position: 'C', rating: 99, legend: true },
  { name: 'Larry Bird', number: 33, position: 'SF', rating: 98, legend: true },
  { name: 'John Havlicek', number: 17, position: 'SG', rating: 95, legend: true },
  { name: 'Bob Cousy', number: 14, position: 'PG', rating: 94, legend: true },
  { name: 'Kevin McHale', number: 32, position: 'PF', rating: 93, legend: true },
  { name: 'Paul Pierce', number: 34, position: 'SF', rating: 91, legend: true },
  { name: 'Kevin Garnett', number: 5, position: 'PF', rating: 96, legend: true },
  { name: 'Robert Parish', number: 0, position: 'C', rating: 89, legend: true },
]

export const lakersAllTime = [
  { name: 'Magic Johnson', number: 32, position: 'PG', rating: 98, legend: true, villain: true },
  { name: 'Kareem Abdul-Jabbar', number: 33, position: 'C', rating: 99, legend: true, villain: true },
  { name: 'Kobe Bryant', number: 24, position: 'SG', rating: 97, legend: true, villain: true },
  { name: 'Shaquille O\'Neal', number: 34, position: 'C', rating: 98, legend: true, villain: true },
  { name: 'Jerry West', number: 44, position: 'SG', rating: 95, legend: true, villain: true },
  { name: 'Elgin Baylor', number: 22, position: 'SF', rating: 94, legend: true, villain: true },
  { name: 'James Worthy', number: 42, position: 'SF', rating: 90, legend: true, villain: true },
  { name: 'Wilt Chamberlain', number: 13, position: 'C', rating: 99, legend: true, villain: true },
]

// ============================================
// 21ST CENTURY LEGENDS ROSTERS
// ============================================

export const celtics21stCentury = [
  { name: 'Paul Pierce', number: 34, position: 'SF', rating: 91, legend: true },
  { name: 'Kevin Garnett', number: 5, position: 'PF', rating: 96, legend: true },
  { name: 'Ray Allen', number: 20, position: 'SG', rating: 90, legend: true },
  { name: 'Rajon Rondo', number: 9, position: 'PG', rating: 85, legend: true },
  { name: 'Jayson Tatum', number: 0, position: 'SF', rating: 95 },
  { name: 'Jaylen Brown', number: 7, position: 'SG', rating: 92 },
  { name: 'Kyrie Irving', number: 11, position: 'PG', rating: 89, legend: true },
  { name: 'Isaiah Thomas', number: 4, position: 'PG', rating: 87, legend: true },
]

export const lakers21stCentury = [
  { name: 'Kobe Bryant', number: 24, position: 'SG', rating: 97, legend: true, villain: true },
  { name: 'Shaquille O\'Neal', number: 34, position: 'C', rating: 98, legend: true, villain: true },
  { name: 'LeBron James', number: 23, position: 'SF', rating: 92, villain: true },
  { name: 'Anthony Davis', number: 3, position: 'PF', rating: 91, villain: true },
  { name: 'Pau Gasol', number: 16, position: 'PF', rating: 88, legend: true, villain: true },
  { name: 'Derek Fisher', number: 2, position: 'PG', rating: 78, legend: true, villain: true },
  { name: 'Lamar Odom', number: 7, position: 'SF', rating: 82, legend: true, villain: true },
  { name: 'Russell Westbrook', number: 0, position: 'PG', rating: 85, villain: true },
]

// ============================================
// ROSTER TYPE DEFINITIONS
// ============================================

export const ROSTER_TYPES = {
  CURRENT_2025: 'current2025',
  ALL_TIME: 'allTime',
  CENTURY_21: 'century21',
}

export const ROSTER_LABELS = {
  [ROSTER_TYPES.CURRENT_2025]: 'Current 2024-25 Rosters',
  [ROSTER_TYPES.ALL_TIME]: 'All-Time Legends',
  [ROSTER_TYPES.CENTURY_21]: '21st Century Legends',
}

export function getRosters(rosterType) {
  switch (rosterType) {
    case ROSTER_TYPES.ALL_TIME:
      return { celtics: celticsAllTime, lakers: lakersAllTime }
    case ROSTER_TYPES.CENTURY_21:
      return { celtics: celtics21stCentury, lakers: lakers21stCentury }
    case ROSTER_TYPES.CURRENT_2025:
    default:
      return { celtics: celtics2025, lakers: lakers2025 }
  }
}

// Legacy exports for backward compatibility
export const celtics = celtics2025
export const lakers = lakers2025

export const getRandomPlayer = (team, rosterType = ROSTER_TYPES.CURRENT_2025) => {
  const rosters = getRosters(rosterType)
  const roster = team === 'celtics' ? rosters.celtics : rosters.lakers
  return roster[Math.floor(Math.random() * roster.length)]
}
