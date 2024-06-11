import { FeatureCollection } from "geojson";
import { RobotRestAPI } from "~/utils/RestApi";

export default defineEventHandler(async (event) => {
    const restApi = RobotRestAPI.fromEvent(event);
    const mapId = getRouterParam(event, 'mapId');
    if (!mapId) {
      throw new Error('Map id missing');
    }
    const map = await restApi.getMap(mapId);
    const overlays = JSON.parse(map.overlays) as FeatureCollection;
    return overlays;
  });