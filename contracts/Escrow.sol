pragma solidity ^0.5.0;

contract Escrow {
    address public payer;
    address payable public payee;
    address public lawyer;
    uint256 public amount;

    constructor(
        address _payer,
        address payable _payee,
        // The lawyer be the one who initializes the contract
        uint256 _amount
    ) public {
        payer = _payer;
        payee = _payee;
        lawyer = msg.sender;
        amount = _amount;
    }

    function deposit() public payable {
        require(msg.sender == payer, "Must be payer");
        require(address(this).balance <= amount, "Must be the escrow amount");
    }

    function release() public {
        require(
            address(this).balance == amount,
            "Full amount of funds must be sent before relasing funds"
        );
        require(msg.sender == lawyer, "Only lawyer can release funds");
        payee.transfer(amount);
    }

    function balanceOf() public view returns (uint256) {
        return address(this).balance;
    }
}
