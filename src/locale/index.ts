import { en } from './en';
import { uk } from './uk';

// Available languages
export const languages = {
    en,
    uk
};

// Language names for display
export const languageNames = {
    en: 'English',
    uk: 'Українська'
};

// Helper type for language codes
export type LanguageCode = keyof typeof languages;

// Format a localized string with variable replacements
export function formatMessage(message: string, variables: Record<string, string | number> = {}): string {
    return message.replace(/{(\w+)}/g, (match, key) => {
        return variables[key] !== undefined ? String(variables[key]) : match;
    });
}

// Get a translation in the specified language
export function getTranslation(key: string, language: LanguageCode = 'en', variables: Record<string, string | number> = {}): string {
    const translations = languages[language] || languages.en;
    const message = (translations as Record<string, string>)[key] || (languages.en as Record<string, string>)[key] || key;

    return formatMessage(message, variables);
}

// Check if a language code is valid
export function isValidLanguage(code: string): code is LanguageCode {
    return Object.keys(languages).includes(code);
}

// Get language name for display
export function getLanguageName(code: LanguageCode): string {
    return languageNames[code] || code;
} 