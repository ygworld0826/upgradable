// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract V2 {
    uint256 public value;

    function setValue(uint256 _value) public {
        value = value + _value;
    }
}
