import { pool, readQuery, schema, table, writeQuery } from "./database";
import "dotenv/config";
import { OLD_SEN_ABI } from "./abi";
import { decodeBalanceOf, multicall } from "./utils";
export const getCurrentBalance = async () => {
	const totalHolders = await readQuery(
		`SELECT COUNT(*) FROM ${schema}.${table}`,
		pool
	);
	const loopNumber = Math.ceil(parseInt(totalHolders[0].count) / 1000);

	for (let i = 0; i < loopNumber; ++i) {
		const holders = await readQuery(
			`SELECT address FROM ${schema}.${table} WHERE tx_hash IS NULL ORDER BY address OFFSET ${
				i * 1000
			} LIMIT 1000  `,
			pool
		);
		const calls = [];
		for (let j = 0; j < holders.length; ++j) {
			const call = {
				address: process.env.OLD_SEN_ADDRESS,
				name: "balanceOf",
				params: [holders[j].address]
			};
			calls.push(call);
		}
		const response = await multicall(OLD_SEN_ABI, calls);
		const result = decodeBalanceOf(calls, response);
		await writeQuery(
			`
            UPDATE ${schema}.${table}
            SET minted_balance = x.minted_balance
            FROM JSON_TO_RECORDSET('${JSON.stringify(result)}')
            AS x(address varchar(255), minted_balance varchar(255), tx_hash varchar(255))
            WHERE holders.address = x.address;`,
			pool
		);
	}
};
