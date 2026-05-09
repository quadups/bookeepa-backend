import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        service: 'bookeepa-api',
        timestamp: '2026-05-02T12:00:00.000Z',
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
