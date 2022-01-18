import { PickType } from '@nestjs/swagger';
import { Vacation } from 'src/entities/Vacation';

export class CreateVacationDto extends PickType(Vacation, [
  'userId',
  'comment',
  'start',
  'end',
  'useDay',
] as const) {}
