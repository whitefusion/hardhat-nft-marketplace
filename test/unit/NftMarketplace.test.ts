import { NftMarketplace, BasicNFT } from "./../../typechain-types"
import { expect, assert } from "chai"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"

const isDevChain = developmentChains.includes(network.name)

!isDevChain
    ? describe.skip
    : describe("NftMarketplace", async function () {
          let nftMarketplace: NftMarketplace, basicNft: BasicNFT, deployer, player
          const PRICE = ethers.utils.parseEther("0.1")
          const TOKEN_ID = 0
          beforeEach(async () => {
              const accounts = await getNamedAccounts()
              const signers = await ethers.getSigners()
              deployer = accounts.deployer
              player = signers[1]
              await deployments.fixture(["all"])
              nftMarketplace = await ethers.getContract("NftMarketplace")
              basicNft = await ethers.getContract("BasicNFT")
              await basicNft.mintNFT()
              await basicNft.approve(nftMarketplace.address, TOKEN_ID)
          })

          it("list and can be bought", async () => {
              await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
              const playerNftMarketplace = await nftMarketplace.connect(player)
              playerNftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
              const newOwner = await basicNft.ownerOf(TOKEN_ID)
              const deployerProceeds = await nftMarketplace.getProceeds(deployer)
              assert(newOwner.toString() == player.address)
              assert(deployerProceeds.toString() == PRICE.toString())
          })
      })
