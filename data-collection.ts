import { pool, poolPg, readQuery, schema, table, writeQuery } from "./database";
import fetch from "node-fetch";
import "dotenv/config";
import { BigNumber, ethers } from "ethers";
export const collectionData = async () => {
	// Connect database
	// Create holder table
	await writeQuery(
		`CREATE TABLE IF NOT EXISTS ${schema}.${table}(
      address VARCHAR(255) PRIMARY KEY,
      current_balance VARCHAR(255),
      tx_hash VARCHAR(255)
      )`,
		pool
	);

	for (let i = 1; i < 10; i++) {
		const response = await fetch(
			`https://api.bscscan.com/api?module=token&action=tokenholderlist&contractaddress=${process.env.OLD_SEN_ADDRESS}&page=${i}&offset=10000&apikey=UJM9AQC9DHYBF94HB7U7NSCNDNXJ1Q6MRG`
		);
		const data = JSON.parse(await response.text());
		const result = data.result;
		const address = JSON.stringify(
			result.map(e => ({ "address": e["TokenHolderAddress"] }))
		);

		await writeQuery(
			`INSERT INTO ${schema}.${table}(address)
		  SELECT *
		  FROM JSON_TO_RECORDSET('${address}') AS x(address VARCHAR(255))`,
			pool
		);
	}
	console.log("Successfully collected data");
	process.exit(1);
};

export const getTotalAmountSENMinted = async () => {
	const listBalancesOfHolders = await readQuery(
		`SELECT minted_balance FROM ${schema}.${table}`,
		pool
	);
	const totalBalance = listBalancesOfHolders.reduce(
		(p, c) => p.add(BigNumber.from(c.minted_balance)),
		BigNumber.from(0)
	);
	return totalBalance.toString();
};
