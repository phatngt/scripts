import dotenv from "dotenv";
import { batchTransferToken } from "./batch-transfer-token";
import { collectionData, getTotalAmountSENMinted } from "./data-collection";
import { getCurrentBalance } from "./get-current-balance";
dotenv.config();

const main = async () => {
	// Collection data from bsc-scan
	// await collectionData();

	// Get current balance of all holder;
	// await getCurrentBalance();

	// Get total SEN need to mint
	console.log("Total balance: ", await getTotalAmountSENMinted());

	// Batch transer token
	await batchTransferToken();
};

main();
