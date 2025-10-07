// This data structure now uses keys that will be translated by the i18next library.
// The actual text is in the /locales folder.
export const guidedProgramsData = [
    {
        id: 'mindfulness-intro-3day',
        titleKey: 'programs.mindfulness_intro.title',
        descriptionKey: 'programs.mindfulness_intro.description',
        days: [
            {
                day: 1,
                titleKey: 'programs.mindfulness_intro.day1.title',
                conceptKey: 'programs.mindfulness_intro.day1.concept',
                exercise: {
                    titleKey: 'programs.mindfulness_intro.day1.exercise.title',
                    descriptionKey: 'programs.mindfulness_intro.day1.exercise.description',
                    category: 'Mindfulness' as const,
                    duration_minutes: 3,
                    stepKeys: [
                        'programs.mindfulness_intro.day1.exercise.steps.0',
                        'programs.mindfulness_intro.day1.exercise.steps.1',
                        'programs.mindfulness_intro.day1.exercise.steps.2',
                        'programs.mindfulness_intro.day1.exercise.steps.3',
                        'programs.mindfulness_intro.day1.exercise.steps.4',
                    ]
                }
            },
            {
                day: 2,
                titleKey: 'programs.mindfulness_intro.day2.title',
                conceptKey: 'programs.mindfulness_intro.day2.concept',
                exercise: {
                    titleKey: 'programs.mindfulness_intro.day2.exercise.title',
                    descriptionKey: 'programs.mindfulness_intro.day2.exercise.description',
                    category: 'Somatic' as const,
                    duration_minutes: 5,
                    stepKeys: [
                        'programs.mindfulness_intro.day2.exercise.steps.0',
                        'programs.mindfulness_intro.day2.exercise.steps.1',
                        'programs.mindfulness_intro.day2.exercise.steps.2',
                        'programs.mindfulness_intro.day2.exercise.steps.3',
                        'programs.mindfulness_intro.day2.exercise.steps.4',
                    ]
                }
            },
            {
                day: 3,
                titleKey: 'programs.mindfulness_intro.day3.title',
                conceptKey: 'programs.mindfulness_intro.day3.concept',
                exercise: {
                    titleKey: 'programs.mindfulness_intro.day3.exercise.title',
                    descriptionKey: 'programs.mindfulness_intro.day3.exercise.description',
                    category: 'Grounding' as const,
                    duration_minutes: 4,
                    stepKeys: [
                        'programs.mindfulness_intro.day3.exercise.steps.0',
                        'programs.mindfulness_intro.day3.exercise.steps.1',
                        'programs.mindfulness_intro.day3.exercise.steps.2',
                        'programs.mindfulness_intro.day3.exercise.steps.3',
                        'programs.mindfulness_intro.day3.exercise.steps.4',
                    ]
                }
            },
        ]
    }
];
