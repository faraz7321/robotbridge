import type { Elevator, Floor } from "./types";

type Status = { currentFloor: string | number; doorsOpen: boolean; outOfOrder: boolean };

export default function useSchindlerElevator(elevatorHost: string): Elevator {
    const elevator: Elevator = {
        elevatorHost,
        currentFloor,
        call,
    };

    async function currentFloor() {
        try {
            const res = await fetch(`http://${elevator.elevatorHost}:/robots/v1/calls`);
            const status = (await res.json()) as Status;
            return `${status.currentFloor}`;
        } catch (error) {
            console.log('Error at Schindler elevator status api call', error);
            // Nothing to do
            return undefined;
        }
    }

    async function call(floor: Floor): Promise<boolean> {
        try {
            await fetch(`http://${elevator.elevatorHost}:calls/${floor}`);
            return true;
        } catch (error) {
            console.log('Error at Schindler elevator call api call', error);
            // Nothing to do
            return false;
        }
    }

    return elevator;
}