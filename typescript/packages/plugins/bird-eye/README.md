# BirdEye Plugin

A GOAT plugin for interacting with the BirdEye API. This plugin provides tools for accessing token prices, DeFi data, wallet information, and trading data across multiple blockchain networks.

## Installation

```bash
pnpm add @goat-sdk/plugin-bird-eye
```

## Usage

```typescript
import { getOnChainTools } from "@goat-sdk/core";
import { birdEye } from "@goat-sdk/plugin-bird-eye";

const tools = getOnChainTools({
  wallet,
  plugins: [
    birdEye({ 
      apiKey: process.env.BIRDEYE_API_KEY // Never hardcode API keys
    })
  ]
});

// Example: Get token price
const price = await tools.getPrice({
  address: "0x...", // Token address
  chain: "ethereum" // Optional chain parameter
});
```

## Available Tools

### Price Data
```typescript
// Get current price for a single token
const price = await tools.getPrice({
  address: "0x...",
  chain: "ethereum",
  checkLiquidity: true
});

// Get prices for multiple tokens
const prices = await tools.getMultiPrice({
  addresses: ["0x...", "0x..."],
  chain: "ethereum"
});

// Get historical price data
const history = await tools.getHistoricalPrice({
  address: "0x...",
  type: "1H", // Options: 1H, 4H, 12H, 1D, 1W, 1M
  chain: "ethereum"
});
```

### Token Information
```typescript
// Get token metadata
const metadata = await tools.getTokenMetadata({
  address: "0x...",
  chain: "ethereum"
});

// Get detailed token overview
const overview = await tools.getTokenOverview({
  address: "0x...",
  chain: "ethereum"
});

// Get token security information
const security = await tools.getTokenSecurity({
  address: "0x...",
  chain: "ethereum"
});
```

### Market Data
```typescript
// Get market metrics
const marketData = await tools.getTokenMarketData({
  address: "0x...",
  chain: "ethereum"
});

// Get trading data
const tradeData = await tools.getTokenTradeData({
  address: "0x...",
  chain: "ethereum"
});
```

## Error Handling

The plugin includes built-in error handling for API requests:

```typescript
try {
  const price = await tools.getPrice({
    address: "0x..."
  });
} catch (error) {
  if (error.message.includes("API key")) {
    console.error("Invalid API key");
  } else {
    console.error("Failed to fetch price:", error.message);
  }
}
```

## Configuration

The plugin requires a BirdEye API key which can be obtained by signing up at [bds.birdeye.so](https://bds.birdeye.so). Always use environment variables for API keys:

```typescript
// .env
BIRDEYE_API_KEY=your_api_key_here

// Usage
birdEye({ apiKey: process.env.BIRDEYE_API_KEY })
```

## License

MIT
