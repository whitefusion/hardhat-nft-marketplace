import { network } from "hardhat"

export function sleep(timeInMs) {
    return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

export async function moveBlocks(amount, sleepAmount = 0) {
    console.log("Moving blocks")
    for (let i = 0; i < amount; i++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
        if (sleepAmount) {
            console.log(`Sleeping for ${sleepAmount}`)
            await sleep(sleepAmount)
        }
    }
}
