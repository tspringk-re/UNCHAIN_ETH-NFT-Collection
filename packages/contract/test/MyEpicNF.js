const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("MyEpicNFT", function () {
  // 各テストの前に呼び出す関数です。テストで使用する変数やコントラクトのデプロイを行います。
  async function deployMyEpicNFTFixture() {
    // === 省略 ===
  }

  // describe('pickRandomFirstWord', function () {
  //   // === 省略 ===
  // });

  // describe('pickRandomSecondWord', function () {
  //   // === 省略 ===
  // });

  // describe('pickRandomThirdWord', function () {
  //   // === 省略 ===
  // });

  // === 追加するテスト ===
  describe("makeAnEpicNFT", function () {
    it("emit a NewEpicNFTMinted event", async function () {
      const { MyEpicNFT, owner } = await loadFixture(deployMyEpicNFTFixture);

      await expect(MyEpicNFT.makeAnEpicNFT())
        .to.emit(MyEpicNFT, "NewEpicNFTMinted")
        .withArgs(owner.address, 0);
    });
  });
  // ===================
});
