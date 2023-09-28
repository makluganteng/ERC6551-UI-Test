import Image from "next/image";
import { Inter } from "next/font/google";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useCallback } from "react";
import { getAddress, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { TokenboundClient, prepareExecuteCall } from "@tokenbound/sdk";
import { Account } from "@/components/Account";
import { ethers } from "ethers";

const inter = Inter({ subsets: ["latin"] });

const sendingTBA = "0x047A2F5c8C97948675786e9a1A12EB172CF802a1";
const recipientAddress = getAddress(
  "0x9FefE8a875E7a9b0574751E191a2AF205828dEA4"
);
const ethAmount = 0.05;
const ethAmountWei = parseUnits(`${ethAmount}`, 18);

export default function Home() {
  const { isConnected, address } = useAccount();
  const signer = useEthersSigner({ chainId: 5 });
  // or useSigner() from legacy wagmi versions: const { data: signer } = useSigner()

  const tokenboundClient = new TokenboundClient({ signer, chainId: 5 });

  useEffect(() => {
    async function testTokenboundClass() {
      const account = await tokenboundClient.getAccount({
        tokenContract: "0xe7134a029cd2fd55f678d6809e64d0b6a0caddcb",
        tokenId: "9",
      });

      const preparedExecuteCall = await tokenboundClient.prepareExecuteCall({
        account: account,
        to: account,
        value: 0n,
        data: "",
      });

      const preparedAccount = await tokenboundClient.prepareCreateAccount({
        tokenContract: "0xe7134a029cd2fd55f678d6809e64d0b6a0caddcb",
        tokenId: "1",
      });

      console.log("getAccount", account);
      console.log("prepareExecuteCall", preparedExecuteCall);
      console.log("preparedAccount", preparedAccount);

      // if (signer) {
      // signer?.sendTransaction(preparedAccount)
      // signer?.sendTransaction(preparedExecuteCall)
      // }
    }

    testTokenboundClass();
  }, [tokenboundClient]);

  const createAccount = useCallback(async () => {
    if (!tokenboundClient || !address) return;
    const createdAccount = await tokenboundClient.createAccount({
      tokenContract: "0xe7134a029cd2fd55f678d6809e64d0b6a0caddcb",
      tokenId: "1",
    });
    alert(`new account: ${createdAccount}`);
  }, [tokenboundClient]);

  const executeCall = useCallback(async () => {
    if (!tokenboundClient || !address) return;
    const executedCall = await tokenboundClient.executeCall({
      account: sendingTBA,
      to: recipientAddress,
      value: ethAmountWei,
      data: "0x",
    });
    executedCall && alert(`Sent ${ethAmount} ETH to ${recipientAddress}`);
  }, [tokenboundClient]);

  const mintNFT = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const abiCoder = new ethers.utils.AbiCoder();
    const mintFunctionSignature = "mint(address,uint256,uint256,bytes)";
    const encodedDataForMint = abiCoder.encode(
      ["address", "uint256", "uint256", "bytes"],
      ["0x0a7E74503a323ee4C21Cc6833F372F9eEACE0645", 1, 1, "0x"]
    );
    const functionSelector = ethers.utils
      .id(mintFunctionSignature)
      .slice(0, 10);
    const finalDataForMint = functionSelector + encodedDataForMint.slice(2); // Data for the mint call
    const preparedTx = await tokenboundClient.prepareExecuteCall({
      account: "0x0a7E74503a323ee4C21Cc6833F372F9eEACE0645",
      to: "0x7049B0A642f69D1B1daC737cA7bF4fA74c212b0F",
      value: 0n, // Assuming no Ether transfer
      data: finalDataForMint, // Encoded mint function as data
    }); // remove 0x from the encodedData
    if (!tokenboundClient || !address) return;
    try {
      const txHash = await tokenboundClient.executeCall({
        account: address, // Replace with the sender's address
        to: preparedTx.to,
        value: 0n, // Assuming no Ether transfer
        data: preparedTx.data,
      });

      console.log("Transaction sent with hash:", txHash);
    } catch (error) {
      console.error("Error sending the transaction:", error);
    }

    // This is a hypothetical gas limit. You might want to estimate the gas needed.
  };

  // const executeMint = useCallback(async () => {
  //   if(!tokenboundClient || !address) return;
  //   const executedCall = await tokenboundClient.executeCall({
  //     account: sendingTBA,
  //     to: "0x7049b0a642f69d1b1dac737ca7bf4fa74c212b0f",
  //     value: ethAmountWei,
  //     data: "0x",
  //   });
  // }, [tokenboundClient]);
  return (
    <>
      <h1>Ethers 5 Signer + RainbowKit + Vite</h1>
      <ConnectButton />
      {isConnected && <Account />}
      {address && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            margin: "32px 0 0",
            maxWidth: "320px",
          }}
        >
          <button onClick={() => executeCall()}>EXECUTE CALL</button>
          <button onClick={() => createAccount()}>CREATE ACCOUNT</button>
          <button onClick={() => mintNFT()}>MINT NFT</button>
        </div>
      )}
    </>
  );
}
