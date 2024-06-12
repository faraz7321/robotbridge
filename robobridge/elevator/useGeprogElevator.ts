import type { Elevator, Floor } from "./types";

export default function useGeprogElevator(elevatorHost: string): Elevator {
    const elevator: Elevator = {
        elevatorHost,
        currentFloor,
        call,
    };

    async function currentFloor() {
        try {
            const res = await fetch(`http://${elevator.elevatorHost}/state`);
            const state = (await res.json()) as { level: number; moving: boolean };
            return `${state.level}`;
        } catch (error) {
            // Nothing to do
            return undefined;
        }
    }

    async function call(floor: Floor): Promise<boolean> {
        try {
            await fetch(`http://${elevator.elevatorHost}/call?level=${floor}`, { method: 'post' });
            return true;
        } catch (error) {
            // Nothing to do
            return false;
        }
    }

    return elevator;
}