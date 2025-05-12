export const PLAN_LIMITS = {
    Starter: {
        maxProducts: 30,
        allowChatImages: false,
        allowChatAudio: false,
        maxUsers: 1,
    },
    Pro: {
        maxProducts: 200,
        allowChatImages: true,
        allowChatAudio: true,
        maxUsers: 5,
    },
    Advance: {
        maxProducts: Infinity,
        allowChatImages: true,
        allowChatAudio: true,
        maxUsers: 10,
    },
};

export function getPlanLimits(planName: string) {
    return PLAN_LIMITS[planName] ?? PLAN_LIMITS.Starter;
}
