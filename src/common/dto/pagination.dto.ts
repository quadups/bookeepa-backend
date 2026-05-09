import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CursorPaginationQueryDto {
  @ApiPropertyOptional({
    description: 'The last item id from the previous page.',
  })
  @IsOptional()
  @IsUUID()
  cursor?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class PaginatedMetaDto {
  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiPropertyOptional()
  nextCursor?: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMetaDto;
}

export function resolvePageLimit(limit?: number): number {
  return Math.min(Math.max(limit ?? 20, 1), 100);
}

export function toPaginatedResult<T extends { id: string }>(
  items: T[],
  limit: number,
): PaginatedResult<T> {
  const hasNextPage = items.length > limit;
  const data = hasNextPage ? items.slice(0, limit) : items;
  const nextCursor = hasNextPage ? data[data.length - 1]?.id ?? null : null;

  return {
    data,
    meta: {
      limit,
      nextCursor,
    },
  };
}
