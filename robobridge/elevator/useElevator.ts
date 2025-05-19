import type { Elevator } from "./types";
import useGeprogElevator from "./useGeprogElevator";
import useLutzElevator from "./useLutzElevator";
import useSchindlerElevator from "./useSchindlerElevator";

type ElevatorType = 'geprog' | 'lutz' | 'schindler';
export const availableTypes: ElevatorType[] = ['geprog', 'lutz', 'schindler'];

export function isValidElevatorType(type: string): type is ElevatorType {
    return availableTypes.includes(type as ElevatorType);
}

export default function useElevator(elevatorType: ElevatorType, elevatorHost: string): Elevator {
    switch (elevatorType) {
        case 'geprog': return useGeprogElevator(elevatorHost);
        case 'lutz': return useLutzElevator(elevatorHost);
        case 'schindler': return useSchindlerElevator(elevatorHost);
        default: throw new Error('Unsupported elevator type');
    }
}