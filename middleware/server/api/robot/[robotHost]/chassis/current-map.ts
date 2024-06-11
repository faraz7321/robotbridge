import { RobotRestAPI } from "~/utils/RestApi";

export default defineEventHandler(async (event) => {
  const restApi = RobotRestAPI.fromEvent(event);
  return await restApi.getCurrentMap();
});
