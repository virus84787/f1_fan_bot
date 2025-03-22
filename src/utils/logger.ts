import { Context } from 'telegraf';

export class Logger {
    private static formatMessage(level: string, message: string, context?: Record<string, any>): string {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] ${level}: ${message}`;

        if (context) {
            logMessage += `\nContext: ${JSON.stringify(context, null, 2)}`;
        }

        return logMessage;
    }

    public static info(message: string, context?: Record<string, any>): void {
        console.log(this.formatMessage('INFO', message, context));
    }

    public static debug(message: string, context?: Record<string, any>): void {
        if (process.env.DEBUG === 'true') {
            console.log(this.formatMessage('DEBUG', message, context));
        }
    }

    public static error(message: string, error?: any, context?: Record<string, any>): void {
        const errorContext = {
            ...context,
            error: error ? {
                message: error.message,
                stack: error.stack,
                ...error
            } : undefined
        };
        console.error(this.formatMessage('ERROR', message, errorContext));
    }

    public static command(ctx: Context, command: string): void {
        const context = {
            command,
            userId: ctx.from?.id,
            username: ctx.from?.username,
            chatId: ctx.chat?.id,
            chatType: ctx.chat?.type,
            messageId: ctx.message?.message_id
        };
        this.info(`Command executed: ${command}`, context);
    }

    public static apiCall(endpoint: string, method: string, params?: any): void {
        this.info(`API Call: ${method} ${endpoint}`, { params });
    }

    public static dbOperation(operation: string, query: string, params?: any[]): void {
        this.info(`Database Operation: ${operation}`, {
            query,
            params: params ? params.map(p => p?.toString() || 'null') : undefined
        });
    }
} 