import { frontEndAbiLocation, frontEndContractFile } from "../helper-hardhat-config"
import "dotenv/config"
import fs from "fs"
import { network, ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { NftMarketplace } from "../typechain-types/contracts"
import { BasicNFT } from "../typechain-types/contracts/test/BasicNft.sol"

const updateFrontEnd: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    if (process.env.UPDATE_FRONTEND) {
        console.log("Writing to Frontend ...")
        // await updateContractAddresses()
        await updateAbi()
        console.log("Frontend Written! ")
    }
}

async function updateAbi() {
    const nftMarketplace: NftMarketplace = await ethers.getContract("NftMarketplace")
    fs.writeFileSync(
        `${frontEndAbiLocation}Nftmarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json).toString()
    )

    const basicNft: BasicNFT = await ethers.getContract("BasicNFT")
    fs.writeFileSync(
        `${frontEndAbiLocation}BasicNFT.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json).toString()
    )
}

async function updateContractAddresses() {
    const chainId = network.config.chainId!.toString()
    const nftMarketplace: NftMarketplace = await ethers.getContract("NftMarketplace")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractFile, "utf8"))
    if (chainId in contractAddresses) {
        if (chainId in contractAddresses) {
            if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
                contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address)
            }
        } else {
            contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
        }
    }

    fs.writeFileSync(frontEndContractFile, JSON.stringify(contractAddresses))
}

export default updateFrontEnd
updateFrontEnd.tags = ["all", "frontend"]
