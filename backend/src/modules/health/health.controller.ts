import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
    constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

    @Get()
    async check() {
        const dbHealthy = this.dataSource.isInitialized;
        const status = dbHealthy ? 'ok' : 'error';

        return {
            status,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbHealthy ? 'connected' : 'disconnected',
        };
    }

    @Get('ready')
    async readiness() {
        try {
            // Check database connection
            await this.dataSource.query('SELECT 1');

            return {
                status: 'ready',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: 'not ready',
                timestamp: new Date().toISOString(),
                error: error.message,
            };
        }
    }

    @Get('live')
    async liveness() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
        };
    }
}
