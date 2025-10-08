// data/meditations.ts

export interface Meditation {
    id: string;
    titleKey: string;
    descriptionKey: string;
    duration_minutes: number;
    guidanceKeys: string[];
}

export const guidedMeditationsData: Meditation[] = [
    {
        id: 'body-scan-5min',
        titleKey: 'meditations.body_scan.title',
        descriptionKey: 'meditations.body_scan.description',
        duration_minutes: 5,
        guidanceKeys: [
            'meditations.body_scan.guidance.0',
            'meditations.body_scan.guidance.1',
            'meditations.body_scan.guidance.2',
            'meditations.body_scan.guidance.3',
            'meditations.body_scan.guidance.4',
            'meditations.body_scan.guidance.5',
        ]
    },
    {
        id: 'loving-kindness-7min',
        titleKey: 'meditations.loving_kindness.title',
        descriptionKey: 'meditations.loving_kindness.description',
        duration_minutes: 7,
        guidanceKeys: [
            'meditations.loving_kindness.guidance.0',
            'meditations.loving_kindness.guidance.1',
            'meditations.loving_kindness.guidance.2',
            'meditations.loving_kindness.guidance.3',
            'meditations.loving_kindness.guidance.4',
            'meditations.loving_kindness.guidance.5',
            'meditations.loving_kindness.guidance.6',
        ]
    },
    {
        id: 'mindful-walking-10min',
        titleKey: 'meditations.mindful_walk.title',
        descriptionKey: 'meditations.mindful_walk.description',
        duration_minutes: 10,
        guidanceKeys: [
            'meditations.mindful_walk.guidance.0',
            'meditations.mindful_walk.guidance.1',
            'meditations.mindful_walk.guidance.2',
            'meditations.mindful_walk.guidance.3',
            'meditations.mindful_walk.guidance.4',
            'meditations.mindful_walk.guidance.5',
        ]
    },
    {
        id: 'gratitude-meditation-5min',
        titleKey: 'meditations.gratitude.title',
        descriptionKey: 'meditations.gratitude.description',
        duration_minutes: 5,
        guidanceKeys: [
            'meditations.gratitude.guidance.0',
            'meditations.gratitude.guidance.1',
            'meditations.gratitude.guidance.2',
            'meditations.gratitude.guidance.3',
            'meditations.gratitude.guidance.4',
            'meditations.gratitude.guidance.5',
        ]
    },
    {
        id: 'mindful-listening-3min',
        titleKey: 'meditations.mindful_listening.title',
        descriptionKey: 'meditations.mindful_listening.description',
        duration_minutes: 3,
        guidanceKeys: [
            'meditations.mindful_listening.guidance.0',
            'meditations.mindful_listening.guidance.1',
            'meditations.mindful_listening.guidance.2',
            'meditations.mindful_listening.guidance.3',
            'meditations.mindful_listening.guidance.4',
        ]
    },
    {
        id: 'thought-noting-5min',
        titleKey: 'meditations.thought_noting.title',
        descriptionKey: 'meditations.thought_noting.description',
        duration_minutes: 5,
        guidanceKeys: [
            'meditations.thought_noting.guidance.0',
            'meditations.thought_noting.guidance.1',
            'meditations.thought_noting.guidance.2',
            'meditations.thought_noting.guidance.3',
            'meditations.thought_noting.guidance.4',
            'meditations.thought_noting.guidance.5',
        ]
    }
];
