import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { ResponseMessage, User } from 'src/decorator/customize';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) { }

  @Post()
  @ResponseMessage('created a new subscriber')
  create(@Body() createSubscriberDto: CreateSubscriberDto, @User() user) {
    return this.subscribersService.create(createSubscriberDto, user);
  }

  @Get()
  @ResponseMessage('fetch subscribers with pagination')
  findAll(
    @Query("current") currentPage: string, // -> const currentPage: string = req.query.page
    @Query("pageSize") limit: string,       // -> const limit: string = req.query.limit
    @Query() qs: string
  ) {
    return this.subscribersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('fetch subscriber by id')
  findOne(@Param('id') id: string) {
    return this.subscribersService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('updated a subscriber')
  update(@Param('id') id: string, @Body() updateSubscriberDto: UpdateSubscriberDto, @User() user) {
    return this.subscribersService.update(id, updateSubscriberDto, user);
  }

  @Delete(':id')
  @ResponseMessage('delete a subscriber')
  remove(@Param('id') id: string, @User() user) {
    return this.subscribersService.remove(id, user);
  }
}
