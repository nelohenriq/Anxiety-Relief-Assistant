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
    },
    {
        id: 'cbt-anxious-thoughts-5day',
        titleKey: 'programs.anxious_thoughts.title',
        descriptionKey: 'programs.anxious_thoughts.description',
        days: [
            {
                day: 1,
                titleKey: 'programs.anxious_thoughts.day1.title',
                conceptKey: 'programs.anxious_thoughts.day1.concept',
                exercise: {
                    titleKey: 'programs.anxious_thoughts.day1.exercise.title',
                    descriptionKey: 'programs.anxious_thoughts.day1.exercise.description',
                    category: 'Cognitive' as const,
                    duration_minutes: 5,
                    stepKeys: [
                        'programs.anxious_thoughts.day1.exercise.steps.0',
                        'programs.anxious_thoughts.day1.exercise.steps.1',
                        'programs.anxious_thoughts.day1.exercise.steps.2',
                        'programs.anxious_thoughts.day1.exercise.steps.3',
                    ]
                }
            },
            {
                day: 2,
                titleKey: 'programs.anxious_thoughts.day2.title',
                conceptKey: 'programs.anxious_thoughts.day2.concept',
                exercise: {
                    titleKey: 'programs.anxious_thoughts.day2.exercise.title',
                    descriptionKey: 'programs.anxious_thoughts.day2.exercise.description',
                    category: 'Cognitive' as const,
                    duration_minutes: 5,
                    stepKeys: [
                        'programs.anxious_thoughts.day2.exercise.steps.0',
                        'programs.anxious_thoughts.day2.exercise.steps.1',
                        'programs.anxious_thoughts.day2.exercise.steps.2',
                        'programs.anxious_thoughts.day2.exercise.steps.3',
                    ]
                }
            },
            {
                day: 3,
                titleKey: 'programs.anxious_thoughts.day3.title',
                conceptKey: 'programs.anxious_thoughts.day3.concept',
                exercise: {
                    titleKey: 'programs.anxious_thoughts.day3.exercise.title',
                    descriptionKey: 'programs.anxious_thoughts.day3.exercise.description',
                    category: 'Cognitive' as const,
                    duration_minutes: 5,
                    stepKeys: [
                        'programs.anxious_thoughts.day3.exercise.steps.0',
                        'programs.anxious_thoughts.day3.exercise.steps.1',
                        'programs.anxious_thoughts.day3.exercise.steps.2',
                        'programs.anxious_thoughts.day3.exercise.steps.3',
                    ]
                }
            },
            {
                day: 4,
                titleKey: 'programs.anxious_thoughts.day4.title',
                conceptKey: 'programs.anxious_thoughts.day4.concept',
                exercise: {
                    titleKey: 'programs.anxious_thoughts.day4.exercise.title',
                    descriptionKey: 'programs.anxious_thoughts.day4.exercise.description',
                    category: 'Cognitive' as const,
                    duration_minutes: 5,
                    stepKeys: [
                        'programs.anxious_thoughts.day4.exercise.steps.0',
                        'programs.anxious_thoughts.day4.exercise.steps.1',
                        'programs.anxious_thoughts.day4.exercise.steps.2',
                        'programs.anxious_thoughts.day4.exercise.steps.3',
                    ]
                }
            },
            {
                day: 5,
                titleKey: 'programs.anxious_thoughts.day5.title',
                conceptKey: 'programs.anxious_thoughts.day5.concept',
                exercise: {
                    titleKey: 'programs.anxious_thoughts.day5.exercise.title',
                    descriptionKey: 'programs.anxious_thoughts.day5.exercise.description',
                    category: 'Cognitive' as const,
                    duration_minutes: 5,
                    stepKeys: [
                        'programs.anxious_thoughts.day5.exercise.steps.0',
                        'programs.anxious_thoughts.day5.exercise.steps.1',
                        'programs.anxious_thoughts.day5.exercise.steps.2',
                        'programs.anxious_thoughts.day5.exercise.steps.3',
                    ]
                }
            }
        ]
    },
    {
        id: 'sleep-hygiene-7day',
        titleKey: 'programs.sleep_improvement.title',
        descriptionKey: 'programs.sleep_improvement.description',
        days: [
            {
                day: 1,
                titleKey: 'programs.sleep_improvement.day1.title',
                conceptKey: 'programs.sleep_improvement.day1.concept',
                exercise: {
                    titleKey: 'programs.sleep_improvement.day1.exercise.title',
                    descriptionKey: 'programs.sleep_improvement.day1.exercise.description',
                    category: 'Behavioral' as const,
                    duration_minutes: 10,
                    stepKeys: [
                        'programs.sleep_improvement.day1.exercise.steps.0',
                        'programs.sleep_improvement.day1.exercise.steps.1',
                        'programs.sleep_improvement.day1.exercise.steps.2',
                        'programs.sleep_improvement.day1.exercise.steps.3',
                    ]
                }
            },
            {
                day: 2,
                titleKey: 'programs.sleep_improvement.day2.title',
                conceptKey: 'programs.sleep_improvement.day2.concept',
                exercise: {
                    titleKey: 'programs.sleep_improvement.day2.exercise.title',
                    descriptionKey: 'programs.sleep_improvement.day2.exercise.description',
                    category: 'Behavioral' as const,
                    duration_minutes: 5,
                    stepKeys: [
                        'programs.sleep_improvement.day2.exercise.steps.0',
                        'programs.sleep_improvement.day2.exercise.steps.1',
                        'programs.sleep_improvement.day2.exercise.steps.2',
                        'programs.sleep_improvement.day2.exercise.steps.3',
                    ]
                }
            },
            {
                day: 3,
                titleKey: 'programs.sleep_improvement.day3.title',
                conceptKey: 'programs.sleep_improvement.day3.concept',
                exercise: {
                    titleKey: 'programs.sleep_improvement.day3.exercise.title',
                    descriptionKey: 'programs.sleep_improvement.day3.exercise.description',
                    category: 'Behavioral' as const,
                    duration_minutes: 2,
                    stepKeys: [
                        'programs.sleep_improvement.day3.exercise.steps.0',
                        'programs.sleep_improvement.day3.exercise.steps.1',
                        'programs.sleep_improvement.day3.exercise.steps.2',
                    ]
                }
            },
            {
                day: 4,
                titleKey: 'programs.sleep_improvement.day4.title',
                conceptKey: 'programs.sleep_improvement.day4.concept',
                exercise: {
                    titleKey: 'programs.sleep_improvement.day4.exercise.title',
                    descriptionKey: 'programs.sleep_improvement.day4.exercise.description',
                    category: 'Cognitive' as const,
                    duration_minutes: 5,
                    stepKeys: [
                        'programs.sleep_improvement.day4.exercise.steps.0',
                        'programs.sleep_improvement.day4.exercise.steps.1',
                        'programs.sleep_improvement.day4.exercise.steps.2',
                    ]
                }
            },
            {
                day: 5,
                titleKey: 'programs.sleep_improvement.day5.title',
                conceptKey: 'programs.sleep_improvement.day5.concept',
                exercise: {
                    titleKey: 'programs.sleep_improvement.day5.exercise.title',
                    descriptionKey: 'programs.sleep_improvement.day5.exercise.description',
                    category: 'Behavioral' as const,
                    duration_minutes: 10,
                    stepKeys: [
                        'programs.sleep_improvement.day5.exercise.steps.0',
                        'programs.sleep_improvement.day5.exercise.steps.1',
                        'programs.sleep_improvement.day5.exercise.steps.2',
                    ]
                }
            },
            {
                day: 6,
                titleKey: 'programs.sleep_improvement.day6.title',
                conceptKey: 'programs.sleep_improvement.day6.concept',
                exercise: {
                    titleKey: 'programs.sleep_improvement.day6.exercise.title',
                    descriptionKey: 'programs.sleep_improvement.day6.exercise.description',
                    category: 'Somatic' as const,
                    duration_minutes: 5,
                    stepKeys: [
                        'programs.sleep_improvement.day6.exercise.steps.0',
                        'programs.sleep_improvement.day6.exercise.steps.1',
                        'programs.sleep_improvement.day6.exercise.steps.2',
                        'programs.sleep_improvement.day6.exercise.steps.3',
                    ]
                }
            },
            {
                day: 7,
                titleKey: 'programs.sleep_improvement.day7.title',
                conceptKey: 'programs.sleep_improvement.day7.concept',
                exercise: {
                    titleKey: 'programs.sleep_improvement.day7.exercise.title',
                    descriptionKey: 'programs.sleep_improvement.day7.exercise.description',
                    category: 'Mindfulness' as const,
                    duration_minutes: 5,
                    stepKeys: [
                        'programs.sleep_improvement.day7.exercise.steps.0',
                        'programs.sleep_improvement.day7.exercise.steps.1',
                        'programs.sleep_improvement.day7.exercise.steps.2',
                        'programs.sleep_improvement.day7.exercise.steps.3',
                    ]
                }
            }
        ]
    }
];
