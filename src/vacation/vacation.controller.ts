import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { VacationService } from './vacation.service';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ReturnVacationDto } from './dto/return-vacation.dto';

@ApiTags('VACATION')
@Controller('vacation')
export class VacationController {
  constructor(private readonly vacationService: VacationService) {}

  @ApiOkResponse({
    description: '등록이 완료되었습니다.',
  })
  @Post()
  create(@Body() createVacationDto: CreateVacationDto) {
    return this.vacationService.create(createVacationDto);
  }

  @ApiOkResponse({
    description:
      '유저 고유 번호와 일치하는 모든 휴가가 배열안에 객체 형태로 리턴 됩니다.',
    type: ReturnVacationDto,
  })
  @Get()
  findAll(@Query('userId') id: number) {
    return this.vacationService.findAll(id);
  }

  @ApiOkResponse({
    description: '선택된 id에 해당하는 휴가를 리턴 합니다.',
    type: ReturnVacationDto,
  })
  @Get('select')
  findOne(@Query('vacationId') id: number) {
    return this.vacationService.findOne(id);
  }

  @ApiOkResponse({
    description: '삭제가 완료 되었습니다.',
  })
  @Delete('delete')
  remove(
    @Body('vacationId') id: number,
    @Query('vacationId') vacationId: number,
  ) {
    return this.vacationService.remove(id);
  }
}
