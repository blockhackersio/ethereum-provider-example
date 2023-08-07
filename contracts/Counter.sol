pragma solidity ^0.8.19;

contract Counter {
    uint256 private count; // Private variable to store the count value

    constructor() {
        count = 0; // Initialize the counter to 0
    }

    function getCount() public view returns (uint256) {
        return count; // Getter function to retrieve the current count value
    }

    function increment() public {
        count++; // Increment the count by 1
    }

    function decrement() public {
        count--; // Decrement the count by 1
    }
}
