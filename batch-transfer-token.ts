import { pool, readQuery, schema, table, writeQuery } from "./database";
import "dotenv/config";
import { adminTool, deployer } from "./contract";

export const batchTransferToken = async () => {
	const totalHolders = await readQuery(
		`SELECT COUNT(*) FROM ${schema}.${table} WHERE tx_hash IS NULL`,
		pool
	);
	console.log("totalHolders: ", totalHolders);
	const loopNumber = Math.ceil(parseInt(totalHolders[0].count) / 100);
	console.log("loopNumber: ", loopNumber);
	for (let i = 0; i < loopNumber; ++i) {
		const holders = await readQuery(
			`SELECT * FROM ${schema}.${table} WHERE tx_hash IS NULL ORDER BY address OFFSET ${
				i * 100
			} LIMIT 100 `,
			pool
		);
		const recipients = [];
		for (let j = 0; j < holders.length; ++j) {
			if (holders[j].tx_hash === null) {
				const receipt = {
					to: holders[j].address,
					amount: holders[j].minted_balance
				};
				recipients.push(receipt);
			}
		}
		const nonce = await deployer.getTransactionCount();
		try {
			const response = await adminTool
				.connect(deployer)
				.transferToken(process.env.NEW_SEN_ADDRESS, recipients);
			await response.wait();
			const { hash } = response;
			const updatedHolders = holders.map(d => ({
				...d,
				tx_hash: hash ? hash.toString() : `error-${nonce}`
			}));

			await writeQuery(
				`
			    UPDATE ${schema}.${table}
			    SET tx_hash = x.tx_hash
			    FROM JSON_TO_RECORDSET('${JSON.stringify(updatedHolders)}')
			    AS x(address varchar(255), minted_balance varchar(255), tx_hash varchar(255))
			    WHERE ${table}.address = x.address;`,
				pool
			);
		} catch (error) {
			console.log("ERROR: ", error.message);
			const updatedHolders = holders.map(d => ({
				...d,
				tx_hash: `error-${nonce}`
			}));
			await writeQuery(
				`
			    UPDATE ${schema}.${table}
			    SET tx_hash = x.tx_hash
			    FROM JSON_TO_RECORDSET('${JSON.stringify(updatedHolders)}')
			    AS x(address varchar(255), minted_balance varchar(255), tx_hash varchar(255))
			    WHERE ${table}.address = x.address;`,
				pool
			);
			process.exit(1);
		}
		console.log(
			`[${nonce}] Successfully transfer to ${i * 100} - ${
				(i + 1) * 100
			} holders `
		);
	}
};
