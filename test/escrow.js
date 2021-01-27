const Escrow = artifacts.require("Escrow");

const assertError = async (promise, error) => {
  try {
    await promise;
  } catch (e) {
    assert(e.message.includes(error));
    return;
  }
  assert(false);
};

contract("Escrow", (accounts) => {
  let escrow = null;
  const [lawyer, payer, recipient] = accounts;
  before(async () => {
    escrow = await Escrow.deployed();
  });

  it("should deposit", async () => {
    await escrow.deposit({ from: payer, value: 900 });
    const escrowBalance = parseInt(await web3.eth.getBalance(escrow.address));
    assert(escrowBalance === 900);
  });

  it("should NOT deposit if sender is not payer", async () => {
    assertError(
      escrow.deposit({ from: accounts[5], value: 100 }),
      "Must be payer"
    );
  });

  it("should NOT deposit if transfer exceeds amount", async () => {
    assertError(
      escrow.deposit({ from: accounts[1], value: 2000 }),
      "Must be the escrow amount"
    );
  });

  it("should NOT released full amount if funds have not been received", async () => {
    assertError(
      escrow.release({ from: lawyer }),
      "Full amount of funds must be sent before releasing funds"
    );
  });

  it("should NOT release funds if sender not lawyer", async () => {
    escrow.deposit({ from: payer, value: 100 });
    assertError(
      escrow.release({ from: accounts[5] }),
      "Only lawyer can release funds"
    );
  });

  it("should release funds", async () => {
    const balanceRecipientBefore = web3.utils.toBN(
      await web3.eth.getBalance(recipient)
    );
    await escrow.release({ from: lawyer });
    const balanceRecipientAfter = web3.utils.toBN(
      await web3.eth.getBalance(recipient)
    );
    assert(
      balanceRecipientAfter.sub(balanceRecipientBefore).toNumber() === 1000
    );
  });
});
