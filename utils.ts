import { AbiItem } from "web3-utils";
import { Interface } from "@ethersproject/abi";
import { MULTICAL_ABI, MULTICAL_DELEGATE_ABI } from "./abi";
import {
	deployer,
	multicallContractEther,
	multicallContractWeb3,
	web3
} from "./contract";

interface Call {
	address: string; // Address of the contract
	name: string; // Function name on the contract (example: balanceOf)
	params?: any[]; // Function params
}

export const multicall = async (abi: any, calls: Call[]) => {
	const itf = new Interface(abi);

	const calldata = calls.map(call => [
		call.address.toLowerCase(),
		itf.encodeFunctionData(call.name, call.params)
	]);

	const { returnData } = await multicallContractWeb3.methods
		.aggregate(calldata)
		.call();
	const res = returnData.map((call, i) =>
		itf.decodeFunctionResult(calls[i].name, call)
	);
	return res;
};

// export const multicallWithSign = async (abi: any, calls: Call[]) => {
// 	const itf = new Interface(abi);

// 	const calldata = calls.map(call => [
// 		call.address.toLowerCase(),
// 		itf.encodeFunctionData(call.name, call.params)
// 	]);
// 	console.log("calldata: ", calldata);

// 	const { returnData } = await multicallContractEther.aggregate(calldata, {
// 		gasLimit: 10000000
// 	});
// 	console.log("returnData: ", returnData);
// 	const res = returnData.map((call, i) =>
// 		itf.decodeFunctionResult(calls[i].name, call)
// 	);
// 	return res;
// };

// export const multicallWithSign = async (abi: any, calls: Call[]) => {
// 	web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);
// 	const account = web3.eth.accounts.wallet[0];
// 	const itf = new Interface(abi);

// 	const calldata = calls.map(call => [
// 		call.address.toLowerCase(),
// 		itf.encodeFunctionData(call.name, call.params)
// 	]);

// 	const mintSenToken = await new web3.eth.Contract(
// 		MULTICAL_DELEGATE_ABI as any,
// 		process.env.MULTICALL_DELEGATE
// 	).methods.aggregate(calldata);

// 	let count = await web3.eth.getGasPrice();
// 	let txData = {
// 		from: account.address,
// 		to: process.env.MULTICALL_DELEGATE,
// 		data: mintSenToken.encodeABI(),
// 		gas: 200000,
// 		gasPrice: count
// 	};
// 	let receipt = await web3.eth.sendTransaction(txData);

// 	console.log("returnData: ", receipt);
// 	// const res = returnData.map((call, i) =>
// 	// 	itf.decodeFunctionResult(calls[i].name, call)
// 	// );
// 	// return res;
// 	return;
// };
export const decodeBalanceOf = (calls: Call[], results: any[]) => {
	return calls.map((call: Call, i: number) => ({
		address: call.params[0],
		minted_balance: results[i][0].toString()
	}));
};
