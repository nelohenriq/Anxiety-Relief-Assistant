import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import { UserProfile, DataConsentLevel } from '../types';
import { logInteraction } from '../services/interactionLogger';

interface OnboardingModalProps {
    onComplete: () => void;
}

const TOTAL_STEPS = 4;

const WelcomeStep: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 10.8295 3 7.5 3C4.17048 3 3 6.25278 3 6.25278C3 6.25278 3 8.87327 5.25 10.5C7.5 12.1267 12 15 12 15C12 15 16.5 12.1267 18.75 10.5C21 8.87327 21 6.25278 21 6.25278C21 6.25278 19.8295 3 16.5 3C13.1705 3 12 6.25278 12 6.25278Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V21" />
            </svg>
            <h2 id="onboarding-title" className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">{t('onboarding.welcome.title')}</h2>
            <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-300">{t('onboarding.welcome.subtitle')}</p>
            <p className="mt-4 text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">{t('onboarding.welcome.body')}</p>
        </div>
    );
}

const FeaturesStep: React.FC = () => {
     const { t } = useTranslation();
    return (
        <div className="text-center">
            <h2 id="onboarding-title" className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{t('onboarding.features.title')}</h2>
            <div className="mt-6 space-y-6">
                 <div className="flex items-start text-left gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{t('onboarding.features.feature1_title')}</h3>
                        <p className="text-neutral-500 dark:text-neutral-400">{t('onboarding.features.feature1_body')}</p>
                    </div>
                 </div>
                 <div className="flex items-start text-left gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-accent-100 dark:bg-accent-500/20 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-600 dark:text-accent-300" viewBox="0 0 20 20" fill="currentColor"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.423-1.423L13.25 18.5l1.188-.648a2.25 2.25 0 011.423-1.423L16.25 15.5l.648 1.188a2.25 2.25 0 011.423 1.423L19.25 18.5l-1.188.648a2.25 2.25 0 01-1.423 1.423z" /></svg>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{t('onboarding.features.feature2_title')}</h3>
                        <p className="text-neutral-500 dark:text-neutral-400">{t('onboarding.features.feature2_body')}</p>
                    </div>
                 </div>
                 <div className="flex items-start text-left gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 7v10zM4 17a1 1 0 001.447.894l4-2A1 1 0 0010 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 004 7v10z" /></svg>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{t('onboarding.features.feature3_title')}</h3>
                        <p className="text-neutral-500 dark:text-neutral-400">{t('onboarding.features.feature3_body')}</p>
                    </div>
                 </div>
            </div>
        </div>
    );
}

const ConsentStep: React.FC<{localConsent: DataConsentLevel, setLocalConsent: (level: DataConsentLevel) => void}> = ({ localConsent, setLocalConsent }) => {
    const { t } = useTranslation();
    return (
         <div className="text-center">
            <h2 id="onboarding-title" className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{t('onboarding.consent.title')}</h2>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">{t('onboarding.consent.subtitle')}</p>
            <fieldset className="mt-6 space-y-4 text-left">
                <legend className="sr-only">Data Consent Level</legend>
                <div onClick={() => setLocalConsent('essential')} className={`p-4 border rounded-lg cursor-pointer transition-all ${localConsent === 'essential' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-500' : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'}`}>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{t('onboarding.consent.consent_essential_title')}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('onboarding.consent.consent_essential_body')}</p>
                </div>
                 <div onClick={() => setLocalConsent('enhanced')} className={`p-4 border rounded-lg cursor-pointer transition-all ${localConsent === 'enhanced' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-500' : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'}`}>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{t('onboarding.consent.consent_enhanced_title')}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('onboarding.consent.consent_enhanced_body')}</p>
                </div>
                 <div onClick={() => setLocalConsent('complete')} className={`p-4 border rounded-lg cursor-pointer transition-all ${localConsent === 'complete' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-500' : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'}`}>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{t('onboarding.consent.consent_complete_title')}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('onboarding.consent.consent_complete_body')}</p>
                </div>
            </fieldset>
             <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">{t('onboarding.consent.body')}</p>
        </div>
    );
};

const ProfileStep: React.FC<{localProfile: UserProfile, handleProfileChange: (e: React.ChangeEvent<HTMLSelectElement>) => void}> = ({ localProfile, handleProfileChange }) => {
    const { t } = useTranslation();
    return (
         <div className="text-center">
            <h2 id="onboarding-title" className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{t('onboarding.profile.title')}</h2>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">{t('onboarding.profile.subtitle')}</p>
            <div className="mt-6 space-y-4 text-left">
                <div>
                    <label htmlFor="workEnvironment" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.work_env_label')}</label>
                    <select name="workEnvironment" id="workEnvironment" value={localProfile.workEnvironment || ''} onChange={handleProfileChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                        <option value="">Select...</option>
                        <option value="office">{t('user_profile.work_env_options.office')}</option>
                        <option value="remote">{t('user_profile.work_env_options.remote')}</option>
                        <option value="student">{t('user_profile.work_env_options.student')}</option>
                        <option value="outdoors_manual">{t('user_profile.work_env_options.outdoors_manual')}</option>
                        <option value="other">{t('user_profile.work_env_options.other')}</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="activityLevel" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.activity_level_label')}</label>
                    <select name="activityLevel" id="activityLevel" value={localProfile.activityLevel || ''} onChange={handleProfileChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                        <option value="">Select...</option>
                        <option value="sedentary">{t('user_profile.activity_level_options.sedentary')}</option>
                        <option value="lightly_active">{t('user_profile.activity_level_options.lightly_active')}</option>
                        <option value="moderately_active">{t('user_profile.activity_level_options.moderately_active')}</option>
                        <option value="very_active">{t('user_profile.activity_level_options.very_active')}</option>
                    </select>
                </div>
            </div>
         </div>
    )
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const { setConsentLevel, profile, setProfile } = useUser();
    const [currentStep, setCurrentStep] = useState(0);
    const [localConsent, setLocalConsent] = useState<DataConsentLevel>('enhanced');
    const [localProfile, setLocalProfile] = useState<UserProfile>({});

    const handleNext = () => {
        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(currentStep + 1);
        }
    };
    
    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }

    const handleFinish = () => {
        logInteraction({ type: 'COMPLETE_ONBOARDING', metadata: { consent_level: localConsent } });
        setConsentLevel(localConsent);
        setProfile({ ...profile, ...localProfile });
        onComplete();
    };
    
    const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalProfile(prev => ({ ...prev, [name]: value }));
    };


    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return <WelcomeStep />;
            case 1:
                return <FeaturesStep />;
            case 2:
                return <ConsentStep localConsent={localConsent} setLocalConsent={setLocalConsent} />;
            case 3:
                return <ProfileStep localProfile={localProfile} handleProfileChange={handleProfileChange} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
                <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                    {renderStepContent()}
                </div>
                
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-2xl">
                    <div className="flex items-center justify-between">
                         <div className="flex-1">
                           {currentStep > 0 && (
                                <button type="button" onClick={handleBack} className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400">
                                     {t('onboarding.buttons.back')}
                                </button>
                           )}
                         </div>
                        <div className="flex items-center gap-3">
                           {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${currentStep === i ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}></div>
                           ))}
                        </div>
                         <div className="flex-1 flex justify-end">
                            {currentStep < TOTAL_STEPS - 1 ? (
                                <button type="button" onClick={handleNext} className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700">
                                    {currentStep === 0 ? t('onboarding.buttons.get_started') : t('onboarding.buttons.next')}
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                     <button type="button" onClick={handleFinish} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 rounded-lg">
                                        {t('onboarding.buttons.skip')}
                                    </button>
                                    <button type="button" onClick={handleFinish} className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700">
                                        {t('onboarding.buttons.finish')}
                                    </button>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;