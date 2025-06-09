export function evaluateGate(gateType, input1, input2 = null) {
  switch (gateType) {
    case 'AND':
      return input1 && input2;
    case 'OR':
      return input1 || input2;
    case 'XOR':
      return input1 !== input2;
    case 'NOT':
      return !input1;
    case 'NAND':
      return !(input1 && input2);
    case 'NOR':
      return !(input1 || input2);
    default:
      return false;
  }
}

export function evaluateCircuit(gates, inputs, outputs, connections) {
  // Create a map to store computed values for each gate output
  const gateOutputs = new Map();
  
  // Create a map to store input values by ID
  const inputValues = new Map();
  inputs.forEach(input => {
    inputValues.set(input.id, input.value === 1);
  });
  
  // Function to get the value from a connection source
  const getSourceValue = (from) => {
    if (from.type === 'input') {
      return inputValues.get(from.id) || false;
    } else {
      // It's a gate output
      const gateKey = `${from.index}-${from.node}`;
      return gateOutputs.get(gateKey) || false;
    }
  };
  
  // Function to evaluate a gate recursively
  const evaluateGateAtIndex = (gateIndex) => {
    const gate = gates[gateIndex];
    if (!gate) return false;
    
    const outputKey = `${gateIndex}-output`;
    
    // If already computed, return cached value
    if (gateOutputs.has(outputKey)) {
      return gateOutputs.get(outputKey);
    }
    
    // Find connections to this gate's inputs
    const input1Conn = connections.find(conn => 
      conn.to.index === gateIndex && conn.to.node === 'input1'
    );
    const input2Conn = connections.find(conn => 
      conn.to.index === gateIndex && conn.to.node === 'input2'
    );
    
    let input1Value = false;
    let input2Value = false;
    
    if (input1Conn) {
      if (input1Conn.from.type === 'input') {
        input1Value = getSourceValue(input1Conn.from);
      } else {
        // Recursively evaluate the source gate
        evaluateGateAtIndex(input1Conn.from.index);
        input1Value = getSourceValue(input1Conn.from);
      }
    }
    
    if (input2Conn && gate.type !== 'NOT') {
      if (input2Conn.from.type === 'input') {
        input2Value = getSourceValue(input2Conn.from);
      } else {
        // Recursively evaluate the source gate
        evaluateGateAtIndex(input2Conn.from.index);
        input2Value = getSourceValue(input2Conn.from);
      }
    }
    
    // Evaluate the gate
    const result = evaluateGate(gate.type, input1Value, input2Value);
    gateOutputs.set(outputKey, result);
    
    return result;
  };
  
  // Evaluate all gates
  gates.forEach((_, index) => {
    evaluateGateAtIndex(index);
  });
  
  // Calculate output values
  const outputValues = new Map();
  outputs.forEach(output => {
    const conn = connections.find(c => 
      c.to.type === 'output' && c.to.id === output.id
    );
    
    if (conn) {
      const value = getSourceValue(conn.from);
      outputValues.set(output.id, value ? 1 : 0);
    } else {
      outputValues.set(output.id, 0);
    }
  });
  
  return {
    gateOutputs: Object.fromEntries(gateOutputs),
    outputValues: Object.fromEntries(outputValues)
  };
}