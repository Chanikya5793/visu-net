import logicGatesJson from './logicGates.json';

interface TrainingData {
    input: number[];
    output: number[];
}

function mapGateType(type: string): number[] {
    switch (type.toUpperCase()) {
        case 'AND':
            return [1, 0, 0, 0, 0];
        case 'OR':
            return [0, 1, 0, 0, 0];
        case 'XOR':
            return [0, 0, 1, 0, 0];
        case 'NAND':
            return [0, 0, 0, 1, 0];
        case 'NOR':
            return [0, 0, 0, 0, 1];
        // Add more gate types as needed
        default:
            return [0, 0, 0, 0, 0];
    }
}

export const logicGateData = {
    training: logicGatesJson.map((entry: any) => {
        const input1 = parseInt(entry["Input 1"], 10);
        const input2Raw = entry["Input 2"];
        let input2: number;

        if (input2Raw === '-') {
            // Assign a default value for unary gates
            input2 = 0;
        } else {
            input2 = parseInt(input2Raw, 10);
        }

        const gateTypeInput = mapGateType(entry["Input 3 (Type)"]);

        const output = parseInt(entry["Expected Output"], 10);

        return {
            // Combine inputs: [Input1, Input2, GateTypeEncoding]
            input: [input1, input2, ...gateTypeInput],
            output: [output]
        };
    })
};