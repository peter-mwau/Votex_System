// const hre = require("hardhat");
import hre from "hardhat";


async function main() {
    const { ethers } = hre;

    const Voting = await ethers.getContractFactory("Voting");

    const voting = await Voting.deploy();

    console.log("Deployed To: ", voting.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })