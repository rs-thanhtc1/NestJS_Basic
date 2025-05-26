import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private configService: ConfigService
  ) {}

  @Get()
  @Render('home')
  getHello() {
    // get port from .env
    console.log(">> check port = ", this.configService.get<String>('PORT'))
    const massage1 = this.appService.getHello();

    return {
      message: massage1
    }
  }
}
