import pg from "pg-promise";
import format from "pg-format";
import "dotenv/config";

export const table = process.env.TABLE;
export const schema = "public";
export const createPostgresSQLDatabase = (dsn: string) => {
	if (dsn.startsWith("postgres")) {
		const pgp = pg();
		const pool = pgp({
			connectionString: dsn,
			max: 100
		});
		return pool;
	}
	console.log("Create pool failed");
	return null;
};

export const writeQuery = async (query: string, pool: pg.IDatabase<{}>) => {
	await pool.query(format(query));
};

export const readQuery = async (query: string, pool: pg.IDatabase<{}>) => {
	return await pool.query(format(query));
};

export const poolPg = () => {
	const dsn = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DB}`;
	return createPostgresSQLDatabase(dsn);
};

export const pool = poolPg();
