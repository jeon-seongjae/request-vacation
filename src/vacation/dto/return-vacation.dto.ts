import { PickType } from '@nestjs/swagger';
import { Vacation } from 'src/entities/Vacation';

export class ReturnVacationDto extends PickType(Vacation, [
  'id',
  'userId',
  'kinds',
  'status',
  'comment',
  'start',
  'end',
  'useDay',
  'createdAt',
  'updatedAt',
] as const) {}
