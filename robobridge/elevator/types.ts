export type Floor = string | undefined;

export type Elevator = {
    elevatorHost: string;
    currentFloor(): Promise<Floor>;
    call: (floor: Floor) => Promise<boolean>;
};