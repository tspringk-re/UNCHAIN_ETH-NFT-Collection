// App.js
// useEffect と useState 関数を React.js からインポートしています。
import React, { useEffect, useState } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import myEpicNft from "./utils/MyEpicNFT.json";
import { ethers } from "ethers";

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = "";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x2a101364b656caeaE54Ed266a7BE92D10F397E1b";

const App = () => {
  /*
   * ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
   */
  const [currentAccount, setCurrentAccount] = useState("");
  /*この段階でcurrentAccountの中身は空*/
  console.log("currentAccount: ", currentAccount);

  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [tokenId, setTokenId] = useState(0);
  const [message, setMessage] = useState("");

  /*
   * ユーザーが認証可能なウォレットアドレスを持っているか確認します。
   */
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    /* ユーザーが認証可能なウォレットアドレスを持っている場合は、
     * ユーザーに対してウォレットへのアクセス許可を求める。
     * 許可されれば、ユーザーの最初のウォレットアドレスを
     * accounts に格納する。
     */
    const accounts = await ethereum.request({ method: "eth_accounts" });
    setMessage("ウォレットに接続してください");

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
      setMessage("「Mint NFT」ボタンをクリックして、NFTを手に入れましょう");
    } else {
      console.log("No authorized account found");
      // setMessage("ウォレットに接続してください");
    }
  };

  /*
   * connectWallet メソッドを実装します。
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /*
       * ウォレットアドレスに対してアクセスをリクエストしています。
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      /*
       * ウォレットアドレスを currentAccount に紐付けます。
       */
      setCurrentAccount(accounts[0]);
      setMessage("「Mint NFT」ボタンをクリックして、NFTを手に入れましょう");
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // setupEventListener 関数を定義します。
  // MyEpicNFT.sol の中で event が　emit された時に、
  // 情報を受け取ります。
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // NFT が発行されます。
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setIsMinting(false);
          setTokenId(tokenId);
          setIsMinted(true);
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("setupEventListener Error!");
      console.log(error);
    }
  };

  const getMintedMessage = () => {
    const getNFTLink = () =>
      `https://gemcase.vercel.app/view/evm/sepolia/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`;
    return (
      <div>
        <p>あなたのウォレットに、Philosopher NFTを送信しました</p>
        <p>
          下記リンクのgemcaseで確認できます。
          <br />
          （※表示されるまで数分かかることがあります）
        </p>
        <p>
          <a target="_blank" style={{ color: "#ffcc00" }} href={getNFTLink()}>
            NFTを確認する
          </a>
        </p>
      </div>
    );
  };

  // App.js
  const askContractToMintNft = async () => {
    // const CONTRACT_ADDRESS = "0x2a101364b656caeaE54Ed266a7BE92D10F397E1b";
    setIsMinted(false);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.");
        setIsMinting(true);
        setMessage("Mint中です。しばらくお待ちください");

        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://sepolia.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  /*
   * ページがロードされたときに useEffect()内の関数が呼び出されます。
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">あなただけの特別な NFT を Mint しよう💫</p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <>
              {!isMinting ? (
                <button
                  onClick={askContractToMintNft}
                  className="cta-button connect-wallet-button"
                >
                  Mint NFT
                </button>
              ) : (
                <button className="cta-button connect-wallet-button" disabled>
                  Mint NFT
                </button>
              )}
            </>
          )}

          <div
            style={{
              color: "#fff",
              margin: "2em",
            }}
          >
            {isMinted ? getMintedMessage() : message}
          </div>
        </div>
        <div className="footer-container"></div>
      </div>
    </div>
  );
};
export default App;
