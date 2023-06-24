import { BasicNFT } from "./../typechain-types/contracts/test/BasicNft.sol/BasicNFT"
import { ethers, network } from "hardhat"
import { NftMarketplace } from "../typechain-types/contracts"
import { moveBlocks } from "../utils/move-blocks"

async function mintAndList() {
    const PRICE = ethers.utils.parseEther("0.1")
    const nftMarketplace: NftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft: BasicNFT = await ethers.getContract("BasicNFT")
    console.log("Minting ... ")

    const mintTx = await basicNft.mintNFT()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt?.events?.[0]?.args?.tokenId

    console.log("Approving NFT ...")
    const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId)
    await approvalTx.wait(1)

    console.log("Listing NFT...")
    const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
    await tx.wait(1)
    console.log("Listed !! ")

    console.log(network.config)
    if (network?.config?.chainId === 31337) {
        await moveBlocks(1, 1000)
    }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
