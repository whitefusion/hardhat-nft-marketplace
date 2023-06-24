# 一个去中心化NFT市场
Hardhat框架

Sepolia部署地址： https://sepolia.etherscan.io/address/0x38e5BB961AEb21A8E93150f1cbFd114F159bd949#code

配套前端代码： https://github.com/whitefusion/nextjs-nft-market

NFT合约代码：https://github.com/whitefusion/hardhat-nft

## Core Methods
- `listItem`: 上架，owner还是有所有权但市场得到转让/交易许可
- `buyItem`： 买入
- `cancelItem`： 下架
- `updateListing`： 更新NFT价格
- `withdrawProceeds`: 我卖出的NFT提现

## 命令行
```
// 部署全部
npx hardhat deploy

// 部署测试
npx hardhat deploy --network hardhat

// 部署测试网络sepolia
npx hardhat deploy --network sepolia

// 更新前端abi和address
npx hardhat deploy --tags frontend

// 单侧， 先部署测试
npm run test

// 正则匹配单侧描述跑某些个单侧
npm run test --grep 'buy'

// 单侧覆盖率报告
npx hardhat coverage

// 跑脚本 mint nft并上架
npx hardhat run ./scripts/mint-and-list

```

## ENV

> 使用前 __.env__ 需自己更新

``` 
// .env例子

// sepolia rpc地址
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/xxxxx
// 钱包私钥，不推荐直接写，自己学的话可以这么苟
PRIVATE_KEY=xxx
// 用于verify
ETHERSCAN_API_KEY=xxx
// 用于gas report, hardhat.config里要先enable
COINMARKETCAP_API_KEY=xxx
// 更新前端合约构建物
UPDATE_FRONTEND=false
```


