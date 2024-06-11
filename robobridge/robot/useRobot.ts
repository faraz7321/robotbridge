import { RobotRestAPI } from "./RestApi";
import { createEnableTopicMessage, parseMessage, type Trajectory, type AutoDoors, type GlobalPath, type PlanningState, type TrackedPose } from "./WebsocketApi";

type ConnectionState = 'Not connected' | 'Connecting...' | 'Connected' | 'Connection failed';

export type Robot = {
  robotHost: string;
  robotSecret: string;
  businessId: string;
  restApi: RobotRestAPI;
  connect: () => void;
  disconnect: () => void;
  socketState: ConnectionState;
  trackedPose: TrackedPose | undefined;
  planningState: PlanningState | undefined;
  trajectory: Trajectory | undefined;
  autoDoors: AutoDoors | undefined;
  globalPath: GlobalPath | undefined;
};

export default function useRobot(robotHost: string, robotSecret: string, businessId: string): Robot {
  const robot: Robot = {
    robotHost,
    robotSecret,
    businessId,
    restApi: new RobotRestAPI(robotHost, robotSecret),
    connect,
    disconnect,
    socketState: 'Not connected',
    trackedPose: undefined,
    planningState: undefined,
    trajectory: undefined,
    autoDoors: undefined,
    globalPath: undefined,
  }
  let currentSocket: WebSocket | undefined = undefined;

  function connect() {
    if (currentSocket) {
      currentSocket.close();
    }

    const socket = new WebSocket(`ws://${robotHost}:8000/ws/v2/topics`);
    robot.socketState = 'Connecting...';
    socket.addEventListener("open", (event) => {
      robot.socketState = 'Connected';
      socket.send(createEnableTopicMessage(['/tracked_pose', '/planning_state', '/trajectory', '/nearby_auto_doors', '/path']));
    });
    socket.addEventListener('error', (event) => {
      robot.socketState = `Connection failed`;
    });
    socket.addEventListener("close", (event) => {
      if (robot.socketState !== `Connection failed`) {
        robot.socketState = 'Not connected';
      }
      currentSocket = undefined;
    });
    socket.addEventListener("message", (event) => {
      const message = parseMessage(event.data.toString());
      if (message.topic === '/tracked_pose') {
        robot.trackedPose = message;
      } else if (message.topic === '/planning_state') {
        robot.planningState = message;
      } else if (message.topic === '/trajectory') {
        robot.trajectory = message;
      } else if (message.topic === '/nearby_auto_doors') {
        robot.autoDoors = message;
      } else if (message.topic === '/path') {
        robot.globalPath = message;
      }
    });

    currentSocket = socket;
  }

  function disconnect() {
    if (currentSocket) {
      currentSocket.close();
    }
  }


  return robot;
}