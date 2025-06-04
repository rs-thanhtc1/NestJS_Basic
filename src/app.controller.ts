import { Controller, Get, Post, Render, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller() // route
export class AppController {
  constructor(private readonly appService: AppService,
              private configService: ConfigService,
              private authService: AuthService
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

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  handleLogin(@Request() req){
    return this.authService.login(req.user)
  }
}
