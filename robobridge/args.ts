import { availableTypes, isValidElevatorType } from "./elevator/useElevator";

export default async function parseArgs() {
    let robotHost = process.env['ROBOT_HOST'];
    while (!robotHost) {
        process.stdout.write('Robot host missing. Enter robot ip address or host name: ');
        for await (const line of console) {
            robotHost = line;
            break;
        }
    }

    let robotSecret = process.env['ROBOT_SECRET']
    while (!robotSecret) {
        process.stdout.write('Robot secret is missing. Enter secret: ');
        for await (const line of console) {
            robotSecret = line;
            break;
        }
    }

    let robotBusinessId = process.env['ROBOT_BUSINESS_ID'];
    while (!robotBusinessId) {
        process.stdout.write('Robot business id missing. Enter business id: ');
        for await (const line of console) {
            robotBusinessId = line;
            break;
        }
    }

    let elevatorType = process.env['ELEVATOR_Type'] || '';
    while (!isValidElevatorType(elevatorType)) {
        process.stdout.write(`Elevator type missing or invalid. Must be one of "${availableTypes.join('", "')}". Enter elevator type: `);
        for await (const line of console) {
            elevatorType = line;
            break;
        }
    }

    let elevatorHost = process.env['ELEVATOR_HOST'];
    while (!elevatorHost) {
        process.stdout.write('Elevator host missing. Enter elevator ip address or host name: ');
        for await (const line of console) {
            elevatorHost = line;
            break;
        }
    }

    return { robotHost, robotSecret, robotBusinessId, elevatorType, elevatorHost };
}