import { Controller, Get, Logger } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

@Public()
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/brands')
  getBrands() {
    const filePath = join(process.cwd(), 'brands.json');
    try {
      if (!existsSync(filePath)) {
        this.logger.error(`File brands.json not found at ${filePath}`);
        return { brands: [] };
      }
      const fileContent = readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      this.logger.error(`Failed to read or parse brands.json: ${error.message}`);
      return { brands: [] };
    }
  }
}
