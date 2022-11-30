import "dotenv/config";
import { ethers } from "ethers";
import Web3 from "web3";
import {
	OLD_SEN_ABI,
	NEW_SEN_ABI,
	MULTICAL_ABI,
	MULTICAL_DELEGATE_ABI,
	ADMIN_TOOL_ABI
} from "./abi";

export const mainProvider = new ethers.providers.JsonRpcProvider(
	process.env.PROVIDER_URL
);

const web3Http = new Web3.providers.HttpProvider(process.env.PROVIDER_URL);
export const web3 = new Web3(web3Http);

export const deployer = new ethers.Wallet(
	process.env.PRIVATE_KEY,
	mainProvider
);

export const newSenTokenContract = new ethers.Contract(
	`${process.env.NEW_SEN_ADDRESS}`,
	NEW_SEN_ABI,
	mainProvider
);

export const oldSenTokenContract = new ethers.Contract(
	`${process.env.OLD_SEN_ADDRESS}`,
	OLD_SEN_ABI,
	mainProvider
);

export const multicallContractWeb3 = new web3.eth.Contract(
	MULTICAL_ABI as any,
	process.env.MULTICALL
);

// export const multicallContractWeb3 = new web3.eth.Contract(
// 	MULTICAL_DELEGATE_ABI as any,
// 	process.env.MULTICALL_DELEGATE
// );

export const multicallContractEther = new ethers.Contract(
	process.env.MULTICALL_DELEGATE,
	MULTICAL_DELEGATE_ABI,
	mainProvider
);

export const adminTool = new ethers.Contract(
	process.env.ADMIN_TOOL,
	ADMIN_TOOL_ABI,
	mainProvider
);
