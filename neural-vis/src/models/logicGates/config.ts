export const logicGateConfig = {
  input: {
    gateTypes: [
      "AND", "OR", "XOR", "NAND", 
      "NOR", "XNOR", "IMPLIES", 
      "NIMPLIES", "NOT", "BUFFER"
    ]
  },
  networkArchitecture: {
    // 1 for input1, 1 for input2, 1 for input2Present, 10 for gate type
    inputSize: 13,
    hiddenLayers: [10, 6],
    outputSize: 2  // Changed from 1 to 2
  }
};