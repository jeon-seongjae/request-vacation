import { Module } from '@nestjs/common';
import { VacationService } from './vacation.service';
import { VacationController } from './vacation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacation } from 'src/entities/Vacation';
import { HttpModule } from '@nestjs/axios';
import { Users } from 'src/entities/Users';

@Module({
  imports: [TypeOrmModule.forFeature([Vacation, Users]), HttpModule],
  controllers: [VacationController],
  providers: [VacationService],
})
export class VacationModule {}
