import type { Elevator } from "./types";
import useGeprogElevator from "./useGeprogElevator";
import useLutzElevator from "./useLutzElevator";

type ElevatorType = 'geprog' | 'lutz';
export const availableTypes: ElevatorType[] = ['geprog', 'lutz'];

export function isValidElevatorType(type: string): type is ElevatorType {
    return availableTypes.includes(type as ElevatorType);
}

export default function useElevator(elevatorType: ElevatorType, elevatorHost: string): Elevator {
    switch (elevatorType) {
        case 'geprog': return useGeprogElevator(elevatorHost);
        case 'lutz': return useLutzElevator(elevatorHost);
        default: throw new Error('Unsupported elevator type');
    }
}