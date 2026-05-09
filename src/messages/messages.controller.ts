import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Message } from '@prisma/client';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginatedResult } from '../common/dto/pagination.dto';
import type { RequestUser } from '../common/types/request-user';
import { MessageQueryDto } from './dto/message-query.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@ApiBearerAuth('Bearer')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  @ApiOperation({ summary: 'Log a manually sent reminder message' })
  @ApiCreatedResponse({ type: MessageResponseDto })
  send(
    @CurrentUser() user: RequestUser,
    @Body() dto: SendMessageDto,
  ): Promise<Message> {
    return this.messagesService.send(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List message logs for a business' })
  @ApiPaginatedResponse(MessageResponseDto)
  list(
    @CurrentUser() user: RequestUser,
    @Query() query: MessageQueryDto,
  ): Promise<PaginatedResult<Message>> {
    return this.messagesService.list(user.id, query);
  }
}
