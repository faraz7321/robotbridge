export class RobotRestAPI {

  public static fromEvent(event: Parameters<typeof getRouterParam>[0]): RobotRestAPI {
    const robotHost = getRouterParam(event, 'robotHost');
    if (!robotHost) {
      throw new Error('Robot host missing');
    }
    const secret = getRequestHeader(event, 'Secret')
    if (!secret) {
      throw new Error('Secret missing');
    }
    return  new RobotRestAPI(robotHost, secret);
  }

  constructor(readonly robotHost: string, readonly secret: string) {}

  private async makeRequest<E extends keyof Endpoints>(endpoint: E, params?: Record<string, string>): Promise<Endpoints[E]> {
    let path: string = endpoint;
    Object.entries(params || {}).forEach(([param, value]) => {
     path = path.replaceAll(`:${param}`, value);
    });
    const response = await fetch(`http://${this.robotHost}:8090/${path}`, {
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
  }
}