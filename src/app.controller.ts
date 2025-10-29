import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Simple ping endpoint to ensure API is reachable.' })
  @ApiOkResponse({ description: 'Service is running.', schema: { example: 'Hello World!' } })
  getHello(): string {
    return this.appService.getHello();
  }
}
