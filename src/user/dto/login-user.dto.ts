import { PickType } from '@nestjs/swagger';
import { Users } from 'src/entities/Users';

export class LoginUserDto extends PickType(Users, [
  'email',
  'password',
] as const) {}
