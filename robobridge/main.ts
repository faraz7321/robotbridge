import { type FeatureCollection, type Geometry } from "geojson";

import parseArgs from "./args";
import { loadTasks } from "./autoxing";
import useElevator from "./elevator/useElevator";
import useRobot from "./robot/useRobot";
import type { Floor } from "./elevator/types";

const args = await parseArgs();

const robot = useRobot(args.robotHost, args.robotSecret, args.robotBusinessId);
robot.connect();
const elevator = useElevator(args.elevatorType, args.elevatorHost);

const TYPE_ELEVATOR_WAITING_POINT = 28;
const TYPE_ELEVATOR_INSIDE = 6;

const floorMap: Record<string, string> = {"Floor1": "1", "Floor2": "2"};

const poisMap: Record<string, { id: string, name: string, coordinates: number[], ori: number; mapUid: string, floor: string, type: number, dockingRadius: number }> = {};
// const pois = await loadPOIs(robot);
// for (const poi of pois) {
//     poisMap[poi._id] = {
//         id: poi._id,
//         name: poi.name,
//         coordinates: poi.coordinate,
//         ori: parseFloat(poi.properties.yaw) / 180 * Math.PI,
//         mapUid: poi.areaId,
//         floor: poi.floorName,
//         type: poi.type,
//         dockingRadius: parseFloat(poi.properties?.dockingRadius || '0.2'),
//     }
// }

const maps = await robot.restApi.getMaps();
const mapsMap: Record<string, (typeof maps)[0]> = {};
for (const map of maps) {
    mapsMap[map.uid] = map;
    const mapDetails = await robot.restApi.getMap(`${map.id}`);
    const { features: pois } = JSON.parse(mapDetails.overlays) as FeatureCollection<Geometry, { name: string; yaw: string; type: string; dockingRadius?: string}>;
    for (const poi of pois) {
        if (typeof poi.id === 'string' && poi.type === 'Feature' && poi.geometry.type === 'Point') {
            poisMap[poi.id] = {
                id: poi.id,
                name: poi.properties.name,
                coordinates: poi.geometry.coordinates,
                ori: parseFloat(poi.properties.yaw) / 180 * Math.PI,
                mapUid: map.uid,
                floor: floorMap[map.map_name],
                type: parseInt(poi.properties.type),
                dockingRadius: parseFloat(poi.properties?.dockingRadius || '0.2'),
            }
        }
    }
}

while (true) {
    console.log('Loading tasks of robot...')
    const tasks = await loadTasks(robot);
    if (tasks.length === 0) {
        console.log('No current task. Falling asleep for 10s');
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        continue;
    }

    const target = tasks[0].taskPts[0].ext;
    const targetPoi = poisMap[target.id];
    if (!targetPoi) {
        console.log('Target poi not found. Falling asleep for 10s', target);
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        continue;
    }
    console.log('Robot is performing task to target', targetPoi);

    const planningState = robot.planningState;
    if (!planningState) {
        console.log('No planning state of robot available. Falling asleep for 10s');
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        continue;
    }

    if (planningState.map_uid === targetPoi.mapUid) {
        console.log('Robot is on same map as target. Falling asleep for 10s');
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        continue;
    }

    if (planningState.move_state === 'moving') {
        console.log('Robot still moving. Falling asleep for 2s');
        await new Promise((resolve) => setTimeout(resolve, 2_000));
        continue;
    }

    const currentPoi = Object.values(poisMap).find((poi) => {
        if (poi.type !== TYPE_ELEVATOR_WAITING_POINT) {
            return false;
        }
        if (!robot.trackedPose) {
            console.log('No tracked pose available');
            return false;
        }
        const distanceToPoi = Math.sqrt(Math.pow(poi.coordinates[0] - robot.trackedPose?.pos[0], 2) + Math.pow(poi.coordinates[1] - robot.trackedPose?.pos[1], 2));
        const isPoi = distanceToPoi <= poi.dockingRadius;
        if (!isPoi) {
            console.log('Distance to ', poi.name, ' too big', distanceToPoi);
        }
        return isPoi;
    });

    if (!currentPoi) {
        console.log('POI of current robot position not found. Falling asleep for 10s');
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        continue;
    }

    if (currentPoi.type !== TYPE_ELEVATOR_WAITING_POINT) {
        console.log('POI is no elevator waiting point. Falling asleep for 10s', currentPoi);
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        continue;
    }

    console.log('Calling elevator to floor where robot currently is:', currentPoi.floor)
    if (!await elevator.call(currentPoi.floor)) {
        console.log('Calling elevator failed. Falling asleep for 10s');
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        continue;
    }

    let currentFloor: Floor | undefined = undefined;
    while ((currentFloor = await elevator.currentFloor()) !== currentPoi.floor) {
        console.log('Waiting for elevator to arrive on floor ', currentPoi.floor, '. Currently it is at floor ', currentFloor, '. Falling asleep for 0.5s');
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const elevatorInsidePoi = Object.values(poisMap).find((poi) => {
        return poi.mapUid === currentPoi.mapUid && poi.type === TYPE_ELEVATOR_INSIDE;
    });
    if (!elevatorInsidePoi) {
        console.log('Elevator inside poi not found. Falling asleep for 10s');
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        continue;
    }

    console.log('Instruct robot to enter elevator', elevatorInsidePoi);
    await robot.restApi.enterElevator(elevatorInsidePoi);

    while (true) {
        if (robot.planningState?.move_state !== 'moving' && robot.trackedPose) {
            const distanceToPoi = Math.sqrt(Math.pow(elevatorInsidePoi.coordinates[0] - robot.trackedPose?.pos[0], 2) + Math.pow(elevatorInsidePoi.coordinates[1] - robot.trackedPose?.pos[1], 2));
            if (distanceToPoi <= elevatorInsidePoi.dockingRadius) {
                break;
            }
        }
        console.log('Waiting for robot to enter elevator. Falling asleep for 0.5s');
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('Calling elevator to floor where target of robot is:', targetPoi.floor)
    if (!await elevator.call(targetPoi.floor)) {
        console.log('Calling elevator failed. Falling asleep for 10s');
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        continue;
    }

    while ((currentFloor = await elevator.currentFloor()) !== targetPoi.floor) {
        console.log('Waiting for elevator to arrive on floor ', targetPoi.floor, '. Currently it is at floor ', currentFloor, '. Falling asleep for 0.5s');
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('Robot arrived on floor', targetPoi.floor, 'Let robot continue with task...');
    await robot.restApi.setCurrentMap(targetPoi.mapUid);

    const elevatorTargetInsidePoi = Object.values(poisMap).find((poi) => {
        return poi.mapUid === targetPoi.mapUid && poi.type === TYPE_ELEVATOR_INSIDE;
    });
    if (!elevatorTargetInsidePoi) {
        console.log('Elevator target inside poi not found. Falling asleep for 10s');
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        continue;
    }

    console.log('Setting current pose of robot to', elevatorTargetInsidePoi);
    await robot.restApi.setCurrentPose(elevatorTargetInsidePoi);
    await robot.restApi.moveTo(targetPoi);
}