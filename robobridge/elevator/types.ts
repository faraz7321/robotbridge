export type Floor = string | number | undefined;

export type Elevator = {
    elevatorHost: string;
    currentFloor(): Promise<Floor>;
    call: (floor: Floor) => Promise<boolean>;
};