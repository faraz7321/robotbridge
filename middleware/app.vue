<template>
  <div class="flex flex-col items-center gap-4">
    <h1 class="text-3xl font-bold my-4">Elevator4Robot Middleware</h1>

    <UDivider size="lg">
      <h2 class="text-2xl font-bold my-4">Current robot state</h2>
    </UDivider>

    <div class="flex flex-col [&>*]:w-full items-center gap-4 w-[300px]">
      <UFormGroup label="Robot Host" name="robot-host"
        description="Just the Hostname or IP address without protocol and port">
        <UInput v-model="robotHost" />
      </UFormGroup>

      <UButton class="justify-center" @click="connectRobot">Connect</UButton>
      <UButton class="justify-center" @click="disconnectRobot">Disconnect</UButton>

      <div>
        <span class="font-bold">Socket state</span>:
        {{ socketState }}
      </div>
    </div>

    <div>
      <div>
        <span class="font-bold">Current position</span>:
        <span v-if="trackedPose">{{ trackedPose.pos }} {{ trackedPose.ori }}</span>
        <span v-else>Unknown</span>
      </div>
      <div>
        <span class="font-bold">Move status</span>:
        <span v-if="planningState">{{ planningState.move_state }}</span>
        <span v-else>Unknown</span>
      </div>
      <div>
        <span class="font-bold">Action type</span>:
        <span v-if="planningState">{{ planningState.action_type }}</span>
        <span v-else>Unknown</span>
      </div>
      <div>
        <span class="font-bold">In elevator?</span>:
        <span v-if="planningState?.in_elevator">Yes</span>
        <span v-else>No</span>
      </div>
      <div>
        <span class="font-bold">Target pos</span>:
        <span v-if="targetPos">{{ targetPos }}</span>
        <span v-else>Unknown</span>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <UButton class="justify-center" @click="showCurrentMap">Current Map</UButton>
      <UButton class="justify-center" @click="showOverlays">Overlays</UButton>
      <UButton class="justify-center" @click="showGlobalPath">Global path</UButton>
      <UModal v-model="overlaysOpen">
        <pre>{{ overlaysData }}</pre>
      </UModal>
    </div>

    <UDivider size="lg">
      <h2 class="text-2xl font-bold my-4">Elevator</h2>
    </UDivider>

    <div class="flex flex-col [&>*]:w-full items-center gap-4 w-[300px]">
      <UFormGroup label="Elevator IP-Address" name="elevator-ip"
        description="Just the IP address without protocol and port">
        <UInput v-model="elevatorIp" />
      </UFormGroup>

      <UButton class="justify-center" @click="connectElevator">Connect</UButton>
      <UButton class="justify-center" @click="elevatorConnectionState = 'Not connected'">Disconnect</UButton>

      <div>
        <span class="font-bold">Connection state</span>:
        {{ elevatorConnectionState }}
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
import useRobot from './utils/useRobot';

type ConnectionState = 'Not connected' | 'Connecting...' | 'Connected' | 'Connection failed';

const { robotHost, robotSecret, connect: connectRobot, disconnect: disconnectRobot, socketState, trackedPose, planningState, globalPath, restApi } = useRobot();

const targetPos = computed(() => {
  if (!globalPath.value || globalPath.value.positions.length === 0) {
    return undefined;
  }
  return globalPath.value.positions[globalPath.value.positions.length - 1];
})

async function showCurrentMap() {
  const { data: currentMap } = await useFetch(`/api/robot/${robotHost.value}/chassis/current-map`, {
    headers: {
      Secret: robotSecret
    }
  });
  if (currentMap.value) {
    alert(`Robot is currently on map "${currentMap.value.map_name}"`);
  } else {
    alert(`Unable to load current map`);
  }
}

async function showGlobalPath() {
  if (globalPath.value) {
    overlaysData.value = JSON.stringify(globalPath.value, undefined, 2);
    overlaysOpen.value = true;
  }
}

const overlaysData = ref<string>();
const overlaysOpen = ref(false);

async function showOverlays() {
  const { data: currentMap } = await useFetch(`/api/robot/${robotHost.value}/chassis/current-map`, {
    headers: {
      Secret: robotSecret,
    }
  });
  if (!currentMap.value) {
    alert(`Unable to load current map`);
    return;
  }
  const { data: overlays } = await useFetch(`/api/robot/${robotHost.value}/maps/${currentMap.value.id}/overlays`, {
    headers: {
      Secret: robotSecret
    }
  });
  if (!overlays.value) {
    alert('Unable to load overlays');
    return;
  }
  overlaysData.value = JSON.stringify(overlays.value.features, undefined, 2);
  overlaysOpen.value = true;
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
