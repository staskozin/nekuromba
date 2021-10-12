const { Client } = require('pg');

const db = new Client({
  application_name: 'nekuromba-bot'
});

(async () => await db.connect())()

export default db
