export interface CognitiveDistortion {
    key: string;
    nameKey: string;
    descriptionKey: string;
}

export const cognitiveDistortions: CognitiveDistortion[] = [
    {
        key: 'all_or_nothing',
        nameKey: 'cognitive_distortions.all_or_nothing.name',
        descriptionKey: 'cognitive_distortions.all_or_nothing.description'
    },
    {
        key: 'overgeneralization',
        nameKey: 'cognitive_distortions.overgeneralization.name',
        descriptionKey: 'cognitive_distortions.overgeneralization.description'
    },
    {
        key: 'mental_filter',
        nameKey: 'cognitive_distortions.mental_filter.name',
        descriptionKey: 'cognitive_distortions.mental_filter.description'
    },
    {
        key: 'catastrophizing',
        nameKey: 'cognitive_distortions.catastrophizing.name',
        descriptionKey: 'cognitive_distortions.catastrophizing.description'
    },
    {
        key: 'personalization',
        nameKey: 'cognitive_distortions.personalization.name',
        descriptionKey: 'cognitive_distortions.personalization.description'
    },
    {
        key: 'mind_reading',
        nameKey: 'cognitive_distortions.mind_reading.name',
        descriptionKey: 'cognitive_distortions.mind_reading.description'
    },
    {
        key: 'fortune_telling',
        nameKey: 'cognitive_distortions.fortune_telling.name',
        descriptionKey: 'cognitive_distortions.fortune_telling.description'
    },
    {
        key: 'emotional_reasoning',
        nameKey: 'cognitive_distortions.emotional_reasoning.name',
        descriptionKey: 'cognitive_distortions.emotional_reasoning.description'
    },
    {
        key: 'should_statements',
        nameKey: 'cognitive_distortions.should_statements.name',
        descriptionKey: 'cognitive_distortions.should_statements.description'
    },
];
