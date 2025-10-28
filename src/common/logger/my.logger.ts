import { ConsoleLogger, Injectable, Logger } from "@nestjs/common";

export class MyLoggerDev extends ConsoleLogger{
    log(message: string, context?: string): void {
        console.log(`[MyLoggerDev]:::${context} | ${message}`)
    }
}