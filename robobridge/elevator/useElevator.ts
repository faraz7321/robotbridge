import type { Elevator } from "./types";
import useGeprogElevator from "./useGeprogElevator";
import useLutzElevator from "./useLutzElevator";

export const availableTypes = ['geprog', 'lutz'];


export default function useElevator(elevatorType: 'geprog' | 'lutz', elevatorHost: string): Elevator {
    switch (elevatorType) {
        case 'geprog': return useGeprogElevator(elevatorHost);
        case 'lutz': return useLutzElevator(elevatorHost);
        default: throw new Error('Unsupported elevator type');
    }
}