import logicGatesJson from './logicGates.json';

export function mapGateType(type: string): number[] {
    const encoding = new Array(10).fill(0);
    const gateTypes = ["AND", "OR", "XOR", "NAND", "NOR", "XNOR", "IMPLIES", "NIMPLIES", "NOT", "BUFFER"];
    const index = gateTypes.indexOf(type.toUpperCase());
    if (index >= 0) {
        encoding[index] = 1;
    }
    return encoding;
}

export const logicGateData = {
    training: logicGatesJson.map((entry: any) => {
        const input1 = Number(entry["Input 1"]);
        const input2 = entry["Input 2"] === '-' ? 0 : Number(entry["Input 2"]);
        const gateType = mapGateType(entry["Input 3 (Type)"]);
        const output = Number(entry["Expected Output"]);

        return {
            input: [input1, input2, ...gateType],
            output: [output]
        };
    })
};