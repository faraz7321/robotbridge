import type { Elevator, Floor } from "./types";

type Status = { currentFloor: Floor; doorsOpen: boolean; outOfOrder: boolean };

export default function useLutzElevator(elevatorHost: string): Elevator {
    const elevator: Elevator = {
        elevatorHost,
        currentFloor,
        call,
    };

    async function currentFloor() {
        try {
            const res = await fetch(`http://${elevator.elevatorHost}/elevator/status`);
            const status = (await res.json()) as Status;
            return status.currentFloor;
        } catch (error) {
            // Nothing to do
            return undefined;
        }
    }

    async function call(floor: Floor): Promise<boolean> {
        try {
            await fetch(`http://${elevator.elevatorHost}/call/${floor}`, { method: 'post' });
            return true;
        } catch (error) {
            // Nothing to do
            return false;
        }
    }

    return elevator;
}