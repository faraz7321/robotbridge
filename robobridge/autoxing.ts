import type { Robot } from "./robot/useRobot";

type Task = { taskPts: { ext: { id: string }}[] };

export async function loadTasks(robot: Robot) {
  const response = await fetch(
    "https://apiglobal.autoxing.com/task/v1.0/list",
    {
      method: "post",
      body: JSON.stringify({
        executeStatus: 2,
        busiIds: [robot.businessId],
        dataItems: ["taskPts"],
      }),
      headers: {
        Authorization: "APPCODE dd7afee0a068431abb2425ac622e70d2",
      },
    }
  );
  const { data } = (await response.json()) as { data: { list: Task[] } };
  return data.list;
}

type Poi = { _id: string; areaId: string; floor: number; floorName: string; name: string; type: number; coordinate: [number, number]; properties: { yaw: string; dockingRadius?: string } };

export async function loadPOIs(robot: Robot) {
  const response = await fetch(
    "https://apiglobal.autoxing.com/geo/poi/list",
    {
      method: "post",
      body: JSON.stringify({"businessId":robot.businessId,"floor":null}),
      headers: {
        Authorization: "APPCODE dd7afee0a068431abb2425ac622e70d2",
      },
    }
  );
  const { data } = (await response.json()) as { data: { list: Poi[] }};
  return data.list;
}

