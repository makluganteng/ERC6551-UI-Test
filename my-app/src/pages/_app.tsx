import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import {
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  localhost,
  goerli,
  sepolia,
  polygonMumbai,
} from "viem/chains";
import { configureChains, mainnet, createConfig, WagmiConfig } from "wagmi";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
const { chains, publicClient } = configureChains(
  [mainnet, localhost, goerli, sepolia, polygonMumbai],
  [
    alchemyProvider({
      apiKey: process.env.ALCHEMY_ID || "7tVsktJMmHlyYh2l2v6zpSYnPxvIcvhC",
    }),
    publicProvider(),
  ]
);
const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains,
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
