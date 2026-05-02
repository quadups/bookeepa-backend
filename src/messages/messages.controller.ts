import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Message } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
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
  @ApiOkResponse({ type: MessageResponseDto, isArray: true })
  list(
    @CurrentUser() user: RequestUser,
    @Query() query: MessageQueryDto,
  ): Promise<Message[]> {
    return this.messagesService.list(user.id, query);
  }
}
