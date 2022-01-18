import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Users } from './Users';

@Entity({ schema: 'KakaoVaction', name: 'vacation' })
export class Vacation {
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: '연차 고유 아이디',
  })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '유저 고유 아이디',
    required: true,
  })
  @Column('int', { name: 'userId', nullable: true })
  userId: number | null;

  @Column('varchar', { name: 'kinds', length: 30 })
  kinds: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '사용전, 사용중, 종료',
    description: '휴가 종류',
    required: true,
  })
  @Column('varchar', { name: 'status', length: 30, default: '사용전' })
  status: string;

  @ApiProperty({
    example: '늦잠',
    description: '사유',
    required: false,
  })
  @Column('varchar', { name: 'comment', length: 255, default: null })
  comment: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2021-01-01',
    description: '시작일, 무조건 예시의 규격을 준수해주세요!',
    required: true,
  })
  @Column('datetime', { name: 'start' })
  start: Date;

  @ApiProperty({
    example: '2021-01-03',
    description: '종료일, 무조건 예시의 규격을 준수해주세요!',
    required: false,
  })
  @Column('datetime', { name: 'end', default: null })
  end: Date;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 3,
    description:
      'useDay는 연차 종류를 판별하기 위한 플래그로 활용 됩니다. 요청시 하루이상 연차는 1, 반차는 0.5, 반반차는 0.25로 보내야 합니다',
    required: true,
  })
  @Column('float', { name: 'useDay' })
  useDay: number;

  @ApiProperty({
    example: '2021-12-22T07:37:19.544Z',
    description: '생성일',
    required: true,
  })
  @CreateDateColumn()
  createdAt: Date;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '2021-12-22T07:37:19.544Z',
    description: '업데이트일',
    required: true,
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Users, (users) => users.vacation, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  users: Users;
}
