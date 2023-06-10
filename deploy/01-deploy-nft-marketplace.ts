import {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains,
    networkConfig,
} from "../helper-hardhat-config"
import { NftMarketplace } from "../typechain-types/contracts/NftMarketplace"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import verify from "../utils/verify"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const currNetworkConfig = networkConfig?.[chainId!] || {}
    const { blockConfirmations } = currNetworkConfig

    const nftMarketplace: NftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: blockConfirmations || 1,
    })
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying ...")
        await verify(nftMarketplace.address, [])
    }
}

module.exports.tags = ["all", "marketplace"]
