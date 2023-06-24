import { NftMarketplace, BasicNFT } from "./../../typechain-types"
import { expect, assert } from "chai"
import { Signer } from "ethers"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"

const isDevChain = developmentChains.includes(network.name)

!isDevChain
    ? describe.skip
    : describe("NftMarketplace", async function () {
          let nftMarketplace: NftMarketplace, basicNft: BasicNFT, deployer, player: Signer
          const PRICE = ethers.utils.parseEther("0.1")
          const TOKEN_ID = 0

          beforeEach(async () => {
              const accounts = await getNamedAccounts()
              const signers = await ethers.getSigners()
              deployer = signers[0]
              player = signers[1]
              await deployments.fixture(["all"])
              nftMarketplace = await ethers.getContract("NftMarketplace")
              basicNft = await ethers.getContract("BasicNFT")
              await basicNft.mintNFT()
              await basicNft.approve(nftMarketplace.address, TOKEN_ID)
          })

          describe("listItem", function () {
              it("emits an event after listing an item", async () => {
                  expect(await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.emit(
                      nftMarketplace,
                      "itemListed"
                  )
              })

              it("already listed item should revert error", async () => {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__AlreadyListed")
              })

              it("only allows owner to list", async () => {
                  const playerNftMarketplace = nftMarketplace.connect(player)
                  await basicNft.approve(await player.getAddress(), TOKEN_ID)
                  await expect(
                      playerNftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotOwner")
              })

              it("needs approval to list", async () => {
                  await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID)
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWithCustomError(
                      nftMarketplace,
                      "NftMarketplace__NotApprovedForMarketplace"
                  )
              })

              it("updates listing with seller and price", async () => {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)
                  assert(listing.price.toString() == PRICE.toString())
                  assert(listing.seller.toString() == deployer.address)
              })
          })

          describe("cancel listing", function () {
              xit("reverts if there is no listing", async () => {
                  await expect(
                      nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotListed")
              })

              it("emits event and removes listing", async () => {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  expect(await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)).to.emit(
                      "ItemCanceled"
                  )
                  const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)
                  assert(listing.price.toString() == "0")
              })
          })
          describe("buyItem", function () {
              it("reverts if the item not listed", async () => {
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotListed")
              })

              it("reverts if the price not met", async () => {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__PriceNotMet")
              })
              it("list and can be bought", async () => {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const playerNftMarketplace = await nftMarketplace.connect(player)
                  playerNftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
                  const newOwner = await basicNft.ownerOf(TOKEN_ID)
                  const deployerProceeds = await nftMarketplace.getProceeds(deployer.address)
                  assert(newOwner.toString() == (await player.getAddress()))
                  assert(deployerProceeds.toString() == PRICE.toString())
              })
          })
          describe("update listing", function () {
              it("must be owner and listed", async () => {
                  await expect(
                      nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotListed")
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const nftMarketplacePlayer = nftMarketplace.connect(player)
                  await expect(
                      nftMarketplacePlayer.updateListing(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotOwner")
              })
              it("updates the price of item", async () => {
                  const updatedPrice = ethers.utils.parseEther("0.2")
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  expect(
                      await nftMarketplace.updateListing(basicNft.address, TOKEN_ID, updatedPrice)
                  ).to.emit("ItemListed")
                  const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)
                  assert(listing.price.toString() === updatedPrice.toString())
              })
          })
          describe("withdraw proceeds", function () {
              it("cannot withdraw if zero", async function () {
                  await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWithCustomError(
                      nftMarketplace,
                      "NftMarketplace__NoProceeds"
                  )
              })
              it("withdraw proceeds", async function () {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const nftMarketplacePlayer = nftMarketplace.connect(player)
                  await nftMarketplacePlayer.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })

                  const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer.address)
                  const deployerBalanceBefore = await deployer.getBalance()
                  const txResp = await nftMarketplace.withdrawProceeds()
                  const txReceipt = await txResp.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const deployerBalanceAfter = await deployer.getBalance()

                  assert(
                      deployerBalanceAfter.add(gasCost).toString() ===
                          deployerProceedsBefore.add(deployerBalanceBefore).toString()
                  )
              })
          })
      })
