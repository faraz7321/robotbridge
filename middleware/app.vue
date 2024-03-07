<template>
  <div class="flex flex-col items-center gap-4">
    <h1 class="text-3xl font-bold my-4">Elevator4Robot Middleware</h1>

    <div class="flex flex-col [&>*]:w-full items-center gap-4 w-[300px]">
      <UFormGroup label="Robot IP-Address" name="robot-ip" description="Just the IP adress without protocol and port">
        <UInput v-model="robotIp" />
      </UFormGroup>
      
      <UButton class="justify-center" @click="connect">Connect</UButton>
      
      <div>
        <span class="font-bold">Socket state</span>: 
        {{  socketState }}
      </div>
    </div>

    <UDivider size="lg" >
      <h2 class="text-2xl font-bold my-4">Current robot state</h2>
    </UDivider>

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

    <div>
      <div>
        <span class="font-bold">Current level</span>:
        <span v-if="elevatorState">{{ elevatorState.level }}</span>
        <span v-else>Unknown</span>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { createEnableTopicMessage, parseMessage } from './utils/WebsocketApi';
import type { PlanningState, TrackedPose } from './utils/WebsocketApi';

const robotIp = ref('192.168.x.x');
const currentSocket = ref<WebSocket>();
const socketState = ref<'Not connected' | 'Connecting...' | 'Connected' | 'Connection failed'>('Not connected');

const trackedPose = ref<TrackedPose>();
const planningState = ref<PlanningState>();
const elevatorState = ref<{ level: number }>();

function connect() {
  if (currentSocket.value) {
    currentSocket.value.close();
  }

  const socket = new WebSocket(`ws://${robotIp.value}:8000/ws/v2/topics`);
  socketState.value = 'Connecting...';
  socket.addEventListener("open", (event) => {
    socketState.value = 'Connected';
    socket.send(createEnableTopicMessage(['/tracked_pose', '/planning_state']));
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
    } else if (message.topic === '/planning_state') {
      planningState.value = message;
    }
  });

  currentSocket.value = socket;
}

const waitingForElevator = computed(() => {

});
</script>
