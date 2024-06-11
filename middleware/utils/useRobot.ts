type ConnectionState = 'Not connected' | 'Connecting...' | 'Connected' | 'Connection failed';

export default function useRobot(): {
  robotHost: Ref<string>,
  robotSecret: Ref<string>,
  connect: () => void,
  disconnect: () => void,
  socketState: Ref<ConnectionState>,
  trackedPose: Ref<TrackedPose | undefined>,
  planningState: Ref<PlanningState | undefined>,
  trajectory: Ref<Trajectory | undefined>,
  autoDoors: Ref<AutoDoors | undefined>,
  globalPath: Ref<GlobalPath | undefined>,
} {
  const robotHost = ref('8882304501908um');
  const robotSecret = ref('dRw6JGyzFFwKNfFPQ8FFF');

  const currentSocket = ref<WebSocket>();
  const socketState = ref<ConnectionState>('Not connected');

  const trackedPose = ref<TrackedPose>();
  const planningState = ref<PlanningState>();
  const trajectory = ref<Trajectory>();
  const autoDoors = ref<AutoDoors>();
  const globalPath = ref<GlobalPath>();

  const targetPos = computed(() => {
    if (!globalPath.value || globalPath.value.positions.length === 0) {
      return undefined;
    }
    return globalPath.value.positions[globalPath.value.positions.length - 1];
  })

  function connect() {
    if (currentSocket.value) {
      currentSocket.value.close();
    }

    const socket = new WebSocket(`ws://${robotHost.value}:8000/ws/v2/topics`);
    socketState.value = 'Connecting...';
    socket.addEventListener("open", (event) => {
      socketState.value = 'Connected';
      socket.send(createEnableTopicMessage(['/tracked_pose', '/planning_state', '/trajectory', '/nearby_auto_doors', '/path']));
    });
    socket.addEventListener('error', (event) => {
      socketState.value = `Connection failed`;
    });
    socket.addEventListener("close", (event) => {
      if (socketState.value !== `Connection failed`) {
        socketState.value = 'Not connected';
      }
      currentSocket.value = undefined;
    });
    socket.addEventListener("message", (event) => {
      const message = parseMessage(event.data);
      if (message.topic === '/tracked_pose') {
        console.log('tracked pose', message);
        trackedPose.value = message;
      } else if (message.topic === '/planning_state') {
        console.log('planning state', message);
        planningState.value = message;
      } else if (message.topic === '/trajectory') {
        trajectory.value = message;
      } else if (message.topic === '/nearby_auto_doors') {
        autoDoors.value = message;
      } else if (message.topic === '/path') {
        globalPath.value = message;
      }
    });

    currentSocket.value = socket;
  }

  function disconnect() {
    if (currentSocket.value) {
      currentSocket.value.close();
    }
  }


  return {
    robotHost,
    robotSecret,
    connect,
    disconnect,
    socketState,
    trackedPose,
    planningState,
    trajectory,
    autoDoors,
    globalPath,
  }
}