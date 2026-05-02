import { BadRequestException, Injectable } from '@nestjs/common';
import { Message, MessageDirection, MessageStatus } from '@prisma/client';
import { TenancyService } from '../common/tenancy/tenancy.service';
import { PrismaService } from '../prisma/prisma.service';
import { MessageQueryDto } from './dto/message-query.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancyService: TenancyService,
  ) {}

  async send(userId: string, dto: SendMessageDto): Promise<Message> {
    await this.tenancyService.assertBusinessMember(userId, dto.businessId);
    await this.assertReferenceBelongsToBusiness(dto);

    return this.prisma.message.create({
      data: {
        businessId: dto.businessId,
        direction: MessageDirection.OUTGOING,
        channel: dto.channel,
        recipientPhone: dto.recipientPhone.trim(),
        messageBody: dto.messageBody.trim(),
        status: MessageStatus.SENT,
        referenceType: dto.referenceType?.trim(),
        referenceId: dto.referenceId,
        createdById: userId,
      },
    });
  }

  async list(userId: string, query: MessageQueryDto): Promise<Message[]> {
    await this.tenancyService.assertBusinessMember(userId, query.businessId);

    return this.prisma.message.findMany({
      where: { businessId: query.businessId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  private async assertReferenceBelongsToBusiness(dto: SendMessageDto) {
    if (!dto.referenceType || !dto.referenceId) {
      return;
    }

    const referenceType = dto.referenceType.trim().toUpperCase();

    if (referenceType === 'CUSTOMER') {
      const customer = await this.prisma.customer.findFirst({
        where: {
          id: dto.referenceId,
          businessId: dto.businessId,
          isDeleted: false,
        },
        select: { id: true },
      });

      if (!customer) {
        throw new BadRequestException(
          'Referenced customer does not belong to this business.',
        );
      }
    }

    if (referenceType === 'INVOICE') {
      const invoice = await this.prisma.invoice.findFirst({
        where: {
          id: dto.referenceId,
          businessId: dto.businessId,
          isDeleted: false,
        },
        select: { id: true },
      });

      if (!invoice) {
        throw new BadRequestException(
          'Referenced invoice does not belong to this business.',
        );
      }
    }
  }
}
