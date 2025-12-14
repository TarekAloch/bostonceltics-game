// Boston Celtics 2024-25 Roster
export const celtics = [
  { name: 'Jayson Tatum', number: 0, position: 'SF', rating: 95 },
  { name: 'Jaylen Brown', number: 7, position: 'SG', rating: 92 },
  { name: 'Derrick White', number: 9, position: 'PG', rating: 85 },
  { name: 'Jrue Holiday', number: 4, position: 'PG', rating: 84 },
  { name: 'Kristaps Porzingis', number: 8, position: 'C', rating: 88 },
  { name: 'Al Horford', number: 42, position: 'C', rating: 78 },
  { name: 'Payton Pritchard', number: 11, position: 'PG', rating: 76 },
  { name: 'Sam Hauser', number: 30, position: 'SF', rating: 72 },
]

// LA Lakers 2024-25 Roster (The Enemy)
export const lakers = [
  { name: 'LeBron James', number: 23, position: 'SF', rating: 92, villain: true },
  { name: 'Anthony Davis', number: 3, position: 'PF', rating: 91, villain: true },
  { name: 'Austin Reaves', number: 15, position: 'SG', rating: 80 },
  { name: "D'Angelo Russell", number: 1, position: 'PG', rating: 79 },
  { name: 'Rui Hachimura', number: 28, position: 'PF', rating: 76 },
  { name: 'Gabe Vincent', number: 7, position: 'PG', rating: 72 },
  { name: 'Jarred Vanderbilt', number: 2, position: 'PF', rating: 74 },
  { name: 'Christian Wood', number: 35, position: 'C', rating: 73 },
]

export const getRandomPlayer = (team) => {
  const roster = team === 'celtics' ? celtics : lakers
  return roster[Math.floor(Math.random() * roster.length)]
}
