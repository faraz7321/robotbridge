import { RobotRestAPI } from "~/utils/RestApi";

export default defineEventHandler(async (event) => {
    const restApi = RobotRestAPI.fromEvent(event);
    const mapId = getRouterParam(event, 'mapId');
    if (!mapId) {
      throw new Error('Map id missing');
    }
    return await restApi.getMap(mapId);
  });