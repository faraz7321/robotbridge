import type { Elevator, Floor } from "./types";

type Status = { currentFloor: string | number; doorsOpen: boolean; outOfOrder: boolean };

export default function useLutzElevator(elevatorHost: string): Elevator {
    const elevator: Elevator = {
        elevatorHost,
        currentFloor,
        call,
    };

    async function currentFloor() {
        try {
            const res = await fetch(`http://${elevator.elevatorHost}:1880/elevator/status`);
            const status = (await res.json()) as Status;
            return `${status.currentFloor}`;
        } catch (error) {
            console.log('Error at LUTZ elevator status api call', error);
            // Nothing to do
            return undefined;
        }
    }

    async function call(floor: Floor): Promise<boolean> {
        try {
            await fetch(`http://${elevator.elevatorHost}:1880/elevator/call/${floor}`, { method: 'post' });
            return true;
        } catch (error) {
            console.log('Error at LUTZ elevator call api call', error);
            // Nothing to do
            return false;
        }
    }

    return elevator;
}