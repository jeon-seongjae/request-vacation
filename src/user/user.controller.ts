import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('USER')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({
    description: '회원가입이 완료되었습니다.',
  })
  @ApiOperation({ summary: '회원가입' })
  @Post()
  async signUp(@Body() data: CreateUserDto) {
    const { email, nickname, password } = data;
    return await this.userService.createUser(email, nickname, password);
  }

  @ApiOkResponse({
    description: `{id:1}`,
  })
  @ApiOperation({ summary: '로그인' })
  @Post('login')
  login(@Body() data: LoginUserDto) {
    const { email, password } = data;
    return this.userService.login(email, password);
  }
}
