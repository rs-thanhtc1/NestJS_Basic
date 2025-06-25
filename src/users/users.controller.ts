import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ResponseMessage("Create a new user")
  @Post()
  create(@Body() createUserDto: CreateUserDto, @User() user) {
    return this.usersService.create(createUserDto, user);
  }

  @ResponseMessage("Fetch User with paginate")
  @Get()
  findAll(
    @Query("current") currentPage: string, // -> const currentPage: string = req.query.page
    @Query("pageSize") limit: string,       // -> const limit: string = req.query.limit
    @Query() qs: string
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage("Fetch user by id")
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ResponseMessage("Update a user")
  @Patch('')
  update(@Body() updateUserDto: UpdateUserDto, @User() user) {
    return this.usersService.update(updateUserDto, user);
  }

  @ResponseMessage("Delete a user")
  @Delete(':id')
  remove(@Param('id') id: string, @User() user) {
    return this.usersService.remove(id, user);
  }
}
