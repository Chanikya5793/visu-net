import logicGatesJson from './logicGates.json';

interface TrainingData {
    input: number[];  // [input1, input2, isUnary, ...gateTypes]
    output: number[];
}

export function mapGateType(type: string): number[] {
    switch (type.toUpperCase()) {
        case 'AND':    return [1, 0, 0, 0, 0, 0, 0, 0, 0];
        case 'OR':     return [0, 1, 0, 0, 0, 0, 0, 0, 0]; 
        case 'XOR':    return [0, 0, 1, 0, 0, 0, 0, 0, 0];
        case 'NAND':   return [0, 0, 0, 1, 0, 0, 0, 0, 0];
        case 'NOR':    return [0, 0, 0, 0, 1, 0, 0, 0, 0];
        case 'XNOR':   return [0, 0, 0, 0, 0, 1, 0, 0, 0];
        case 'IMPLIES':return [0, 0, 0, 0, 0, 0, 1, 0, 0];
        case 'NIMPLIES':return[0, 0, 0, 0, 0, 0, 0, 1, 0];
        case 'NOT':    return [0, 0, 0, 0, 0, 0, 0, 0, 1];
        case 'BUFFER': return [0, 0, 0, 0, 0, 0, 0, 0, 0];
        default:       return [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
}

export const logicGateData = {
    training: logicGatesJson.map((entry: any) => {
        const input1 = parseInt(entry["Input 1"], 10);
        const input2Raw = entry["Input 2"];
        const isUnary = input2Raw === '-' ? 1 : 0;
        const input2 = isUnary ? 0 : parseInt(input2Raw, 10);
        const gateTypeInput = mapGateType(entry["Input 3 (Type)"]);
        const output = parseInt(entry["Expected Output"], 10);

        return {
            input: [input1, input2, isUnary, ...gateTypeInput],
            output: [output]
        };
    })
};