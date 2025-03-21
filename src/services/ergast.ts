import axios from 'axios';
import { Logger } from '../utils/logger';

const PRIMARY_BASE_URL = 'http://ergast.com/api/f1';
const FALLBACK_BASE_URL = 'https://api.jolpi.ca/ergast/f1';
const CURRENT_YEAR = 2025; // Hardcoded year for the F1 season

export interface Race {
    season: string;
    round: string;
    raceName: string;
    Circuit: {
        circuitId: string;
        circuitName: string;
        Location: {
            lat: string;
            long: string;
            locality: string;
            country: string;
        };
        url: string;
    };
    date: string;
    time?: string;
    url: string;
    // Additional fields for session timing
    FirstPractice?: {
        date: string;
        time: string;
    };
    SecondPractice?: {
        date: string;
        time: string;
    };
    ThirdPractice?: {
        date: string;
        time: string;
    };
    Qualifying?: {
        date: string;
        time: string;
    };
    Sprint?: {
        date: string;
        time: string;
    };
}

export interface DriverStanding {
    position: string;
    points: string;
    wins: string;
    Driver: {
        driverId: string;
        givenName: string;
        familyName: string;
        permanentNumber?: string;
        nationality?: string;
        url?: string;
    };
    Constructors: Array<{
        constructorId: string;
        name: string;
    }>;
}

export interface ConstructorStanding {
    position: string;
    points: string;
    wins: string;
    Constructor: {
        constructorId: string;
        name: string;
    };
}

export class ErgastService {
    private static useAlternativeApi = false;
    private static apiCallCount = {
        total: 0,
        success: 0,
        failed: 0,
        primary: 0,
        fallback: 0
    };

    private static get BASE_URL(): string {
        return this.useAlternativeApi ? FALLBACK_BASE_URL : PRIMARY_BASE_URL;
    }

    /**
     * Returns the current F1 season year (2025)
     */
    public static getCurrentYear(): number {
        return CURRENT_YEAR;
    }

    private static logApiRequest(url: string, method: string, params?: any): void {
        this.apiCallCount.total++;
        if (this.useAlternativeApi) {
            this.apiCallCount.fallback++;
        } else {
            this.apiCallCount.primary++;
        }

        Logger.apiCall(url, method, {
            apiSource: this.useAlternativeApi ? 'jolpi.ca' : 'ergast.com',
            endpoint: url.replace(this.BASE_URL, ''),
            params: params || {},
            year: this.getCurrentYear(),
            apiCallStats: { ...this.apiCallCount }
        });
    }

    private static logApiSuccess(url: string, responseSize: number, timeMs: number): void {
        this.apiCallCount.success++;
        Logger.info('API request successful', {
            url,
            apiSource: this.useAlternativeApi ? 'jolpi.ca' : 'ergast.com',
            responseSize: `${Math.round(responseSize / 1024)} KB`,
            timeMs: `${timeMs} ms`,
            successRate: `${Math.round((this.apiCallCount.success / this.apiCallCount.total) * 100)}%`
        });
    }

    private static logApiFailure(url: string, error: any): void {
        this.apiCallCount.failed++;
        Logger.error('API request failed', {
            url,
            apiSource: this.useAlternativeApi ? 'jolpi.ca' : 'ergast.com',
            errorCode: error.response?.status || 'Unknown',
            errorMessage: error.message || String(error),
            failureRate: `${Math.round((this.apiCallCount.failed / this.apiCallCount.total) * 100)}%`
        });
    }

    public static getApiStats(): any {
        return {
            ...this.apiCallCount,
            successRate: `${Math.round((this.apiCallCount.success / this.apiCallCount.total) * 100)}%`,
            primaryRate: `${Math.round((this.apiCallCount.primary / this.apiCallCount.total) * 100)}%`,
            fallbackRate: `${Math.round((this.apiCallCount.fallback / this.apiCallCount.total) * 100)}%`
        };
    }

    private static async fetch<T>(endpoint: string): Promise<T> {
        const startTime = Date.now();
        try {
            const apiUrl = `${this.BASE_URL}${endpoint}.json`;
            this.logApiRequest(apiUrl, 'GET');

            const response = await axios.get(apiUrl);
            const endTime = Date.now();
            const timeMs = endTime - startTime;

            const responseSize = JSON.stringify(response.data).length;
            this.logApiSuccess(apiUrl, responseSize, timeMs);

            return response.data.MRData as T;
        } catch (error: any) {
            const apiUrl = `${this.BASE_URL}${endpoint}.json`;
            this.logApiFailure(apiUrl, error);

            // If already using alternative API, don't try fallback
            if (this.useAlternativeApi || !endpoint.startsWith('/')) {
                throw error;
            }

            // Try with the alternative API
            const fallbackStartTime = Date.now();
            try {
                Logger.info('Attempting to use alternative Ergast API (jolpi.ca)', {
                    originalEndpoint: endpoint,
                    reason: 'Primary API failure'
                });
                this.useAlternativeApi = true;

                // Remove the leading slash for the alternative API
                const modifiedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
                const fallbackUrl = `${FALLBACK_BASE_URL}/${modifiedEndpoint}.json`;

                this.logApiRequest(fallbackUrl, 'GET');
                const response = await axios.get(fallbackUrl);

                const endTime = Date.now();
                const timeMs = endTime - fallbackStartTime;
                const responseSize = JSON.stringify(response.data).length;
                this.logApiSuccess(fallbackUrl, responseSize, timeMs);

                return response.data.MRData as T;
            } catch (fallbackError: any) {
                const fallbackUrl = `${FALLBACK_BASE_URL}/${endpoint.substring(1)}.json`;
                this.logApiFailure(fallbackUrl, fallbackError);
                Logger.error('Both primary and fallback APIs failed', {
                    endpoint,
                    primaryError: error.message || String(error),
                    fallbackError: fallbackError.message || String(fallbackError)
                });
                throw fallbackError;
            }
        }
    }

    public static resetApiChoice(): void {
        this.useAlternativeApi = false;
        Logger.info('Reset to primary Ergast API');
    }

    public static forceAlternativeApi(): void {
        this.useAlternativeApi = true;
        Logger.info('Forced to use alternative Ergast API (jolpi.ca)');
    }

    public static getCurrentApiStatus(): string {
        return this.useAlternativeApi
            ? 'Using alternative Ergast API (jolpi.ca)'
            : 'Using primary Ergast API (ergast.com)';
    }

    public static async getCurrentSchedule(): Promise<Race[]> {
        const currentYear = this.getCurrentYear();
        return this.getScheduleByYear(currentYear);
    }

    public static async getScheduleByYear(year: number): Promise<Race[]> {
        Logger.info(`Fetching F1 schedule for year ${year}`);
        const data = await this.fetch<any>(`/${year}`);
        return data.RaceTable.Races;
    }

    public static async getNextRace(): Promise<Race | null> {
        const races = await this.getCurrentSchedule();
        const now = new Date();
        const upcomingRaces = races.filter(race => {
            const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
            return raceDate > now;
        });

        return upcomingRaces.length > 0 ? upcomingRaces[0] : null;
    }

    public static async getDriverStandings(): Promise<DriverStanding[]> {
        const data = await this.fetch<any>('/2025/driverStandings');
        return data.StandingsTable.StandingsLists[0]?.DriverStandings || [];
    }

    public static async getConstructorStandings(): Promise<ConstructorStanding[]> {
        const data = await this.fetch<any>('/2025/constructorStandings');
        return data.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
    }

    public static async getLastRaceResults(): Promise<any> {
        const data = await this.fetch<any>('/2025/last/results');
        return data.RaceTable.Races[0];
    }

    public static async getQualifyingResults(round: number): Promise<any> {
        const data = await this.fetch<any>(`/2025/${round}/qualifying`);
        return data.RaceTable.Races[0];
    }
} 