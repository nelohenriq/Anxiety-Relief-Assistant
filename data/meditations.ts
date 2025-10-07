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
    }
];
