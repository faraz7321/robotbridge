type TopicType = '/tracked_pose' | '/planning_state' | '/trajectory' | 'unknown';

type BaseMessage<Topic extends TopicType> = {
    topic: Topic;
}

export type TrackedPose = BaseMessage<'/tracked_pose'> & {
    pos: [number, number];
    ori: number;
}

export type PlanningState = BaseMessage<'/planning_state'> & {
    map_uid: string;
    action_id: number;
    action_type: 'none' | 'standard' | 'charge' | 'along_give_route' | 'return_to_elevator_waiting_point' | 'enter_elevator' | 'leave_elevator';
    move_state: 'none' | 'idle' | 'moving' | 'succeeded' | 'failed' | 'cancelled';
    fail_reason?: number;
    fail_reason_str?: string;
    remaining_distance: number;
    target_poses: {
        pos: [number, number, number];
        ori: number;
    }[];
}

export type Trajectory = BaseMessage<'/trajectory'> & {
    points: [number, number][];
}

type UnknownMessage = BaseMessage<'unknown'>;

type Messages = TrackedPose | PlanningState | Trajectory;

export function parseMessage(data: string): UnknownMessage | Messages {
    try {
        return JSON.parse(data);
    } catch {
        return { topic: 'unknown' };
    }
}

export function createEnableTopicMessage(topics: Messages['topic'][]): string {
    return JSON.stringify({ enable_topic: topics });
}