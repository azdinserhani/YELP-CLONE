import 'dotenv/config'
import pg from "pg";

const db = new pg.Client()
db.connect();

export default db;