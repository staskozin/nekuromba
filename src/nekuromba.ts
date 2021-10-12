import db from './db'

type NekurombaStat = {
  total: number,
  averageAllTime: number,
  averageMonth: number,
  averageWeek: number,
  today: number,
  last: Date,
  formattedLast: string
}

export async function getStat(user_id: number, date: Date = new Date()): Promise<NekurombaStat> {
  const last = await getLast(user_id)
  const stat: NekurombaStat = {
    total: await getTotal(user_id),
    averageAllTime: await getAverageAllTime(user_id, date),
    averageMonth: await getAverageMonth(user_id, date),
    averageWeek: await getAverageWeek(user_id, date),
    today: await getToday(user_id, date),
    last,
    formattedLast: getFormattedLast(last)
  }
  return stat
}

export async function addCigarette(user_id: number): Promise<boolean> {
  try {
    await db.query('INSERT INTO smoked VALUES ($1, $2)', [user_id, new Date()])
    return true
  } catch (e) {
    return false
  }
}

export async function addUser(user_id: number): Promise<void> {
  await db.query('INSERT INTO users VALUES ($1) ON CONFLICT DO NOTHING', [user_id])
}

async function getTotal(user_id: number): Promise<number> {
  const query = 'SELECT COUNT(smoke_date) AS total ' +
    'FROM smoked ' +
    'WHERE user_id = $1'
  return (await db.query(query, [user_id])).rows[0].total
}

async function getAverageAllTime(user_id: number, date: Date = new Date()): Promise<number> {
  const query = 'SELECT ROUND((COUNT(smoke_date) / EXTRACT(DAY FROM $1 - MIN(smoke_date)))::numeric, 2) AS averagealltime ' +
    'FROM smoked ' +
    'WHERE user_id = $2'
  return (await db.query(query, [date, user_id])).rows[0].averagealltime
}

async function getAverageMonth(user_id: number, date: Date = new Date()): Promise<number> {
  const query = "SELECT ROUND(((SELECT COUNT(smoke_date) FROM smoked WHERE smoke_date >= $1::timestamptz - INTERVAL '30 days') / EXTRACT(DAY FROM $1::timestamptz - ($1::timestamptz - INTERVAL '30 days')))::numeric, 2) AS averagemonth " +
    'FROM smoked ' +
    'WHERE user_id = $2 ' +
    'GROUP BY averagemonth'
  return (await db.query(query, [date, user_id])).rows[0].averagemonth
}

async function getAverageWeek(user_id: number, date: Date = new Date()): Promise<number> {
  const query = "SELECT ROUND(((SELECT COUNT(smoke_date) FROM smoked WHERE smoke_date >= $1::timestamptz - INTERVAL '7 days') / EXTRACT(DAY FROM $1::timestamptz - ($1::timestamptz - INTERVAL '7 days')))::numeric, 2) AS averageweek " +
    'FROM smoked ' +
    'WHERE user_id = $2 ' +
    'GROUP BY averageweek'
  return (await db.query(query, [date, user_id])).rows[0].averageweek
}

async function getToday(user_id: number, date: Date = new Date()): Promise<number> {
  const today = new Date(date.getTime())
  if (today.getHours() >= 0 && today.getHours() < 6)
    today.setDate(today.getDate() - 1)
  today.setHours(6)
  const query = 'SELECT COUNT(smoke_date) AS today ' +
    'FROM smoked ' +
    'WHERE smoke_date >= $1::timestamptz AND user_id = $2'
  return (await db.query(query, [today, user_id])).rows[0].today
}

async function getLast(user_id: number): Promise<Date> {
  const query = 'SELECT MAX(smoke_date) AS last ' +
    'FROM smoked ' +
    'WHERE user_id = $1'
  return (await db.query(query, [user_id])).rows[0].last
}

function getFormattedLast(date: Date): string {
  // 10.10.2021 в 20:03:04
  let month: number | string = date.getMonth() + 1
  if (month < 10) month = '0' + month
  let day: number | string = date.getDate()
  if (day < 10) day = '0' + day
  let hours: number | string = date.getHours()
  if (hours < 10) hours = '0' + hours
  let minutes: number | string = date.getMinutes()
  if (minutes < 10) minutes = '0' + minutes
  let seconds: number | string = date.getSeconds()
  if (seconds < 10) seconds = '0' + seconds
  return `${day}.${month}.${date.getFullYear()} в ${hours}:${minutes}:${seconds}`
}
