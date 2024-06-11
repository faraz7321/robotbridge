export class RobotRestAPI {
  constructor(readonly robotHost: string, readonly secret: string) {}

  private async makeRequest<E extends keyof Endpoints>(endpoint: E, params?: Record<string, string>, body?: Record<string, unknown>): Promise<Endpoints[E]> {
    let path: string = endpoint;
    Object.entries(params || {}).forEach(([param, value]) => {
     path = path.replaceAll(`:${param}`, value);
    });
    const response = await fetch(`http://${this.robotHost}:8090/${path}`, {
      method: body ? 'post' : 'get',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Secret: this.secret
      }
    });
    const data = await response.json();
    return data as Endpoints[E];
  }

  async getMaps() {
    return await this.makeRequest('maps');
  }

  async getMap(mapId: string) {
    return await this.makeRequest(`maps/:mapId`, { mapId });
  }

  async getCurrentMap() {
    return await this.makeRequest('chassis/current-map');
  }

  async setCurrentMap(mapUid: string) {
    return await this.makeRequest('chassis/current-map', undefined, { map_uid: mapUid });
  }

  async enterElevator(params: { coordinates: number[]; ori: number }) {
    return await this.makeRequest('chassis/moves', undefined, {
      "creator": "robobridge",
      "type": "standard",
      "target_x": params.coordinates[0],
      "target_y": params.coordinates[1],
      "target_ori": params.ori
    });
  }

  async moveTo(params: { coordinates: number[]; ori: number }) {
    return await this.makeRequest('chassis/moves', undefined, {
      "creator": "robobridge",
      "type": "standard",
      "target_x": params.coordinates[0],
      "target_y": params.coordinates[1],
      "target_ori": params.ori
    });
  }

  async setCurrentPose(params: { coordinates: number[]; ori: number }) {
    return await this.makeRequest('chassis/moves', undefined, {
      position: [...params.coordinates, 0],
      ori: params.ori,
    });
  }
}

type Endpoints = {
  'maps': {
    id: number;
    uid: string;
    map_name: string;
    create_time: number;
    map_version: number;
    overlays_version: number;
  }[],
  'maps/:mapId': {
    id: number;
    uid: string;
    map_name: string;
    create_time: number;
    map_version: number;
    overlays_version: number;
    overlays: string;
  },
  'chassis/current-map': {
    id: number;
    uid: string;
    map_name: string;
    create_time: number;
    map_version: number;
    overlays_version: number;
  },
  'chassis/moves': {

  }
}