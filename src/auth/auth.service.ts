import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import ms from 'ms';
import { use } from 'passport';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';

@Injectable()
export class AuthService {

  constructor(private usersService: UsersService, private jwtService: JwtService, private configService: ConfigService) { }

  // username/pass là 2 tham số thư viện passport nó ném về
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password)
      if (isValid === true) {
        return user;
      }
    }
    return null;
  }

  async create(registerUserDto: RegisterUserDto) {
    let user = await this.usersService.register({
      ...registerUserDto
    })
    return { _id: user?._id, createdAt: user?.createdAt }
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: "token login",
      iss: "from server",
      _id,
      name,
      email,
      role
    };

    const refresh_token = this.createRefreshToken(payload);

    // update user with refresh token
    await this.usersService.updateUserToken(refresh_token, _id);

    // set refresh token as cookies
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE'))
    })

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role
      }

    };
  }

  createRefreshToken = (payload) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000
    });
    return refresh_token;
  }

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET")
      })

      let user = await this.usersService.findUserByToken(refreshToken);
      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: "token refresh",
          iss: "from server",
          _id,
          name,
          email,
          role
        };

        const refresh_token = this.createRefreshToken(payload);

        // update user with refresh token
        await this.usersService.updateUserToken(refresh_token, _id.toString());

        // set refresh token as cookies
        response.clearCookie("refresh_token")
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE'))
        })

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role
          }

        };

      } else {
        throw new BadRequestException(`Refresh token không hợp lệ`)
      }
    } catch (error) {
      throw new BadRequestException(`Refresh token không hợp lệ`)
    }
  }

  logout = async (response: Response, user: IUser) => {
    await this.usersService.updateUserToken("", user._id);
    response.clearCookie("refresh_token");
    return 'ok';
  }

}
