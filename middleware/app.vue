<template>
  <div class="flex flex-col items-center gap-4">
    <h1 class="text-3xl font-bold my-4">Elevator4Robot Middleware</h1>

    <UDivider size="lg" >
      <h2 class="text-2xl font-bold my-4">Current robot state</h2>
    </UDivider>

    <div class="flex flex-col [&>*]:w-full items-center gap-4 w-[300px]">
      <UFormGroup label="Robot IP-Address" name="robot-ip" description="Just the IP adress without protocol and port">
        <UInput v-model="robotIp" />
      </UFormGroup>
      
      <UButton class="justify-center" @click="connectRobot">Connect</UButton>
      <UButton class="justify-center" @click="disconnectRobot">Disconnect</UButton>
      
      <div>
        <span class="font-bold">Socket state</span>: 
        {{  socketState }}
      </div>
    </div>

    <div>
      <div>
        <span class="font-bold">Current position</span>:
        <span v-if="trackedPose">{{ trackedPose.pos }}</span>
        <span v-else>Unknown</span>
      </div>
      <div>
        <span class="font-bold">Move status</span>: 
        <span v-if="planningState">{{ planningState.move_state }}</span>
        <span v-else>Unknown</span>
      </div>
    </div>

    <UDivider size="lg" >
      <h2 class="text-2xl font-bold my-4">Elevator</h2>
    </UDivider>

    <div class="flex flex-col [&>*]:w-full items-center gap-4 w-[300px]">
      <UFormGroup label="Elevator IP-Address" name="elevator-ip" description="Just the IP address without protocol and port">
        <UInput v-model="elevatorIp" />
      </UFormGroup>
      
      <UButton class="justify-center" @click="connectElevator">Connect</UButton>
      <UButton class="justify-center" @click="elevatorConnectionState = 'Not connected'">Disconnect</UButton>
      
      <div>
        <span class="font-bold">Connection state</span>: 
        {{  elevatorConnectionState }}
      </div>
    </div>

    <div class="flex flex-col items-center gap-4">
      <div>
        <span class="font-bold">Current level</span>:
        <span v-if="elevatorState">{{ elevatorState.level }}</span>
        <span v-else>Unknown</span>
      </div>

      <div>
        <span class="font-bold">Status</span>:
        <span v-if="elevatorState">{{ elevatorState.state }}</span>
        <span v-else>Unknown</span>
      </div>

      <UButton class="justify-center" @click="callElevator(1)">Call to level 1</UButton>
      <UButton class="justify-center" @click="callElevator(2)">Call to level 2</UButton>
      <UButton class="justify-center" @click="callElevator(3)">Call to level 3</UButton>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { createEnableTopicMessage, parseMessage } from './utils/WebsocketApi';
import type { PlanningState, TrackedPose, Trajectory } from './utils/WebsocketApi';

type ConnectionState = 'Not connected' | 'Connecting...' | 'Connected' | 'Connection failed';

const robotIp = ref('192.168.x.x');
const currentSocket = ref<WebSocket>();
const socketState = ref<ConnectionState>('Not connected');

const trackedPose = ref<TrackedPose>();
const planningState = ref<PlanningState>();
const trajectory = ref<Trajectory>();

watch(trajectory, () => {
  if (trajectory.value) {
    console.log('Tarjectory points: ');
    trajectory.value.points.forEach((point) => console.log(point));
  }
});

function connectRobot() {
  if (currentSocket.value) {
    currentSocket.value.close();
  }

  const socket = new WebSocket(`ws://${robotIp.value}:8000/ws/v2/topics`);
  socketState.value = 'Connecting...';
  socket.addEventListener("open", (event) => {
    socketState.value = 'Connected';
    socket.send(createEnableTopicMessage(['/tracked_pose', '/planning_state', '/trajectory']));
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
      trackedPose.value = message;
    }
    if (message.topic === '/planning_state') {
      planningState.value = message;
    }
    if (message.topic === '/trajectory') {
      trajectory.value = message;
    }
  });

  currentSocket.value = socket;
}

function disconnectRobot() {
  if (currentSocket.value) {
    currentSocket.value.close();
  }
}

const elevatorIp = ref('192.168.x.x');
const elevatorConnectionState = ref<ConnectionState>('Not connected');
type ElevatorState = { level: number; state: string };
const elevatorState = ref<ElevatorState>();

async function connectElevator() {
  try {
    elevatorConnectionState.value = 'Connecting...';
    const res = await fetch(`http://${elevatorIp.value}`);
    if (res.status !== 200) {
      throw new Error('Connection failed');
    }
    elevatorConnectionState.value = 'Connected';
  } catch {
    elevatorConnectionState.value = 'Connection failed';
  }
}

onMounted(() => {
  setInterval(async () => {
    if (elevatorConnectionState.value !== 'Connected') {
      return;
    }
    try {
      const res = await fetch(`http://${elevatorIp.value}/state`);
      const state: ElevatorState = await res.json();
      elevatorState.value = state;
    } catch (error) {
      // Nothing to do
    }
  }, 3000);
});

async function callElevator(level: number) {
  if (elevatorConnectionState.value !== 'Connected') {
    return;
  }
  try {
    await fetch(`http://${elevatorIp.value}/call?level=${level}`, { method: 'post' });
  } catch (error) {
    // Nothing to do
  }
}
</script>
