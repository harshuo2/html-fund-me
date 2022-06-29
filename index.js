import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constant.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect // on clicking, it will now connect to connect function
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    // we furnished this situation only because if metamask is present,
    // windows.ethereum will not return anything
    //console.log("I see a metamask there ^-^")
    await window.ethereum.request({ method: "eth_requestAccounts" }) // connect metamask to our DApp
    connectButton.innerHTML = "Connected!"
  } else {
    connectButton.innerHTML = "Please install metamask"
  }
}

// fund function
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount} HAR`)
  const sendValue = ethers.utils.parseEther(ethAmount)
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    // to interact with the contract we need the followung...
    // provider/ connection-> RPC_URL
    const provider = new ethers.providers.Web3Provider(window.ethereum) // we connected to metamask
    // signer/ wallet-> PRIVATE KEY
    const signer = provider.getSigner() // as provider is already connected to metamask
    // contract we will interact with; for the contract, we need its ABI and address
    const contract = new ethers.Contract(contractAddress, abi, signer)

    //contract object created
    try {
      const transactionResponse = await contract.fund({
        value: sendValue,
      })
      await listenForTransactionMine(transactionResponse, provider)
      console.log("Done funding")
    } catch (error) {
      console.log(error)
    }
  }
}

async function getBalance() {
  // check if metamask is present
  if (typeof window.ethereum != "undefined") {
    // get the provider (signer)-> metamask is our provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // get the balance
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
    // display the balance
  }
}

async function withdraw() {
  // check if metamask is attached
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      // const transactionResponse= await contract.withdraw()
      const transactionResponse = await contract.withdraw()
      // once we have made the transactionResponse, we then wait to listen to its hash
      await listenForTransactionMine(transactionResponse, provider)
      console.log("Withdrawal successful")
    } catch (error) {
      console.log(error)
    }
  }
  // make a provider, the cotract, and the signer
  // execute the withdraw function.
  // we then listen to this transaction mine
}

// create a function to check if transaction has passed! and If it has passed, return some value...
function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`)
  return new Promise((resolve, reject) => {
    //provider.once is basically, once it gets one thing, then it proceeds to pursue the second thing. the second thing, i.e. the listener is also a func
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Transaction mined with ${transactionReceipt.confirmations} confirmations`
      )
      resolve()
    })
  })
}

//withdraw
