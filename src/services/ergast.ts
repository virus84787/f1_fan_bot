import axios from 'axios';
import { Logger } from '../utils/logger';

// Always use jolpi.ca API endpoint as requested
const BASE_URL = 'https://api.jolpi.ca/ergast/f1';
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
    private static apiCallCount = {
        total: 0,
        success: 0,
        failed: 0
    };

    /**
     * Returns the current F1 season year (2025)
     */
    public static getCurrentYear(): number {
        return CURRENT_YEAR;
    }

    private static logApiRequest(url: string, method: string, params?: any): void {
        this.apiCallCount.total++;

        Logger.apiCall(url, method, {
            apiSource: 'jolpi.ca',
            endpoint: url.replace(BASE_URL, ''),
            params: params || {},
            year: this.getCurrentYear(),
            apiCallStats: { ...this.apiCallCount }
        });
    }

    private static logApiSuccess(url: string, responseSize: number, timeMs: number): void {
        this.apiCallCount.success++;
        Logger.info('API request successful', {
            url,
            apiSource: 'jolpi.ca',
            responseSize: `${Math.round(responseSize / 1024)} KB`,
            timeMs: `${timeMs} ms`,
            successRate: `${Math.round((this.apiCallCount.success / this.apiCallCount.total) * 100)}%`
        });
    }

    private static logApiFailure(url: string, error: any): void {
        this.apiCallCount.failed++;
        Logger.error('API request failed', {
            url,
            apiSource: 'jolpi.ca',
            errorCode: error.response?.status || 'Unknown',
            errorMessage: error.message || String(error),
            failureRate: `${Math.round((this.apiCallCount.failed / this.apiCallCount.total) * 100)}%`
        });
    }

    public static getApiStats(): any {
        return {
            ...this.apiCallCount,
            successRate: `${Math.round((this.apiCallCount.success / this.apiCallCount.total) * 100)}%`
        };
    }

    private static async fetch<T>(endpoint: string): Promise<T> {
        const startTime = Date.now();
        try {
            // Make sure endpoint is properly formatted for the jolpi.ca API
            const formattedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
            const apiUrl = `${BASE_URL}/${formattedEndpoint}.json`;

            this.logApiRequest(apiUrl, 'GET');
            const response = await axios.get(apiUrl);

            const endTime = Date.now();
            const timeMs = endTime - startTime;
            const responseSize = JSON.stringify(response.data).length;

            this.logApiSuccess(apiUrl, responseSize, timeMs);
            return response.data.MRData as T;
        } catch (error: any) {
            const formattedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
            const apiUrl = `${BASE_URL}/${formattedEndpoint}.json`;

            this.logApiFailure(apiUrl, error);
            throw error;
        }
    }

    public static getCurrentApiStatus(): string {
        return 'Using Ergast API (jolpi.ca)';
    }

    public static async getCurrentSchedule(): Promise<Race[]> {
        const currentYear = this.getCurrentYear();
        return this.getScheduleByYear(currentYear);
    }

    public static async getScheduleByYear(year: number): Promise<Race[]> {
        Logger.info(`Fetching F1 schedule for year ${year}`);
        const data = await this.fetch<any>(`${year}`);
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
        const data = await this.fetch<any>('2025/driverStandings');
        return data.StandingsTable.StandingsLists[0]?.DriverStandings || [];
    }

    public static async getConstructorStandings(): Promise<ConstructorStanding[]> {
        const data = await this.fetch<any>('2025/constructorStandings');
        return data.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
    }

    // Get the last race results
    public static async getLastRaceResults(): Promise<any> {
        const data = await this.fetch<any>('current/last/results');
        return data.RaceTable.Races[0] || null;
    }

    // Get qualifying results for a specific round
    public static async getQualifyingResults(round: number): Promise<any> {
        const data = await this.fetch<any>(`current/${round}/qualifying`);
        return data.RaceTable.Races[0] || null;
    }
} 