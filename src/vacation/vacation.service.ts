import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isArray } from 'class-validator';
import { Users } from 'src/entities/Users';
import { Vacation } from 'src/entities/Vacation';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';

const getDifference = (date1: Date, date2: Date) => {
  const date1utc = Date.UTC(
    date1.getFullYear(),
    date1.getMonth(),
    date1.getDate(),
  );
  const date2utc = Date.UTC(
    date2.getFullYear(),
    date2.getMonth(),
    date2.getDate(),
  );
  let day = 1000 * 60 * 60 * 24;
  return (date2utc - date1utc) / day;
};

@Injectable()
export class VacationService {
  constructor(
    @InjectRepository(Vacation)
    private vacationRepository: Repository<Vacation>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private httpService: HttpService,
  ) {}

  async create({ userId, comment, start, end, useDay }) {
    let kinds: string = '';
    let minusAnnual: number = 0;
    let holiday: number = 0;
    let result: Array<string> = [];
    let startYear: string = start.substr(0, 4);
    let startMonth: string = start.substr(5, 2);

    let firstMonth: any;
    let secondMonth: any;

    let endYear: string = '';
    let endMonth: string = '';

    let fixStart = new Date(start);
    let endDay = new Date(end);
    let holidayList = [];

    if (useDay !== 1 && useDay !== 0.5 && useDay !== 0.25)
      throw new UnauthorizedException(
        'useDay는 연차 종류 분류를 위한 flag로 하루 이상의 연차는 1, 반차는 0.5, 반반차는 0.25를 보내주세요.',
      );

    let today = new Date();
    let difDay = getDifference(today, new Date(start));

    if (useDay >= 1 && !end) {
      throw new UnauthorizedException('종료일을 넣어주세요.');
    } else if (useDay < 1 && end) {
      throw new UnauthorizedException('반차, 반반차는 종료일이 필요없습니다.');
    }

    const getDate = (start: Date) => {
      let week = ['일', '월', '화', '수', '목', '금', '토'];
      let dayStart = week[start.getDay()];
      return dayStart;
    };

    const amongDay = (start: Date, end: Date) => {
      let regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);

      while (start <= end) {
        var date = start.toISOString().split('T')[0];
        result.push(date);
        start.setDate(start.getDate() + 1);
      }
    };

    const allVacation = async (year: string, month: string): Promise<any> => {
      let queryParams =
        '?' +
        encodeURIComponent('serviceKey') +
        '=GCevw6j%2FqgqO4wqppoorXkSLVG5kFiEG%2F97ukG%2FJWKM6zfTsCwX23ozxEqbps2RgTw6IJNIB2lvs0f6T%2BXhUWQ%3D%3D';

      queryParams +=
        '&' + encodeURIComponent('solYear') + '=' + encodeURIComponent(year);

      queryParams +=
        '&' + encodeURIComponent('solMonth') + '=' + encodeURIComponent(month);

      let url =
        'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo';
      url += queryParams;
      const dayData = await this.httpService.get(url).toPromise();
      return dayData.data.response.body.items;
    };

    const getHoliday = (month) => {
      if (month) {
        if (isArray(month.item) === true) {
          for (const a of month.item) {
            let str = `${a.locdate}`;
            holidayList.push(
              new Date(
                `${str.substr(0, 4)}-${str.substr(4, 2)}-${str.substr(6)}`,
              )
                .toISOString()
                .split('T')[0],
            );
          }
        } else {
          let str = `${month.item.locdate}`;
          holidayList.push(
            new Date(`${str.substr(0, 4)}-${str.substr(4, 2)}-${str.substr(6)}`)
              .toISOString()
              .split('T')[0],
          );
        }
      }
    };

    let canAnnual = await this.userRepository.findOne({
      where: { id: userId, deleted: false },
    });

    let lastMiusDay = 0;

    if (useDay >= 1) {
      if (difDay < 0)
        throw new UnauthorizedException(
          '연차 시작일은 현재보다 동일하거나 미래여야 합니다.',
        );

      let startDay = new Date(start);
      endYear = end.substr(0, 4);
      endMonth = end.substr(5, 2);
      kinds = '연차';

      const different = getDifference(startDay, endDay);
      if (different < 1) {
        throw new UnauthorizedException(
          '종료일은 시작일보다 나중이어야 합니다.',
        );
      }

      amongDay(startDay, endDay);

      firstMonth = await allVacation(startYear, startMonth);
      if (startYear === endYear && startMonth === endMonth) {
        getHoliday(firstMonth);
      } else {
        secondMonth = await allVacation(endYear, endMonth);
        getHoliday(firstMonth);
        getHoliday(secondMonth);
      }

      let minusHoliday = 0;
      if (holidayList.length > 0) {
        for (const a of holidayList) {
          let check = result.indexOf(a);
          if (check >= 0) {
            minusHoliday += 1;
            result.splice(check, 1);
          }
        }
      }

      for (const among of result) {
        let day = getDate(new Date(among));
        if (day === '토' || day === '일') {
          holiday += 1;
        }
      }

      lastMiusDay = different + 1 - (holiday + minusHoliday);

      if (canAnnual.annual === 0) {
        throw new UnauthorizedException('연차를 모두 소진 하였습니다.');
      } else if (canAnnual.annual < different) {
        throw new UnauthorizedException(
          '사용 할 수 있는 연차를 초과하였습니다.',
        );
      }

      const vacation = await this.vacationRepository.findOne({
        where: {
          userId: userId,
          start: fixStart,
          end: endDay,
          status: '사용전',
        },
      });

      const halfVacation = await this.vacationRepository.findOne({
        where: [
          {
            userId: userId,
            start: fixStart,
            status: '사용전',
            kinds: '반차',
          },
          {
            userId: userId,
            start: fixStart,
            status: '사용전',
            kinds: '반반차',
          },
        ],
      });

      const amongVacation = await this.vacationRepository.findOne({
        where: [
          {
            userId: userId,
            end: MoreThan(fixStart),
            start: LessThan(fixStart),
          },
          { userId: userId, end: MoreThan(endDay), start: LessThan(endDay) },
        ],
      });

      if (vacation || halfVacation) {
        throw new UnauthorizedException('동일한 휴가가 존재 합니다.');
      }

      if (amongVacation)
        throw new UnauthorizedException('휴가 일정이 중복됩니다.');

      minusAnnual = canAnnual.annual - lastMiusDay;

      canAnnual.annual = minusAnnual;

      let newVacation = new Vacation();

      newVacation.userId = userId;
      newVacation.comment = comment;
      newVacation.start = fixStart;
      newVacation.end = endDay;
      newVacation.useDay = lastMiusDay;
      newVacation.kinds = kinds;

      await this.vacationRepository.save(newVacation);

      await this.userRepository.save(canAnnual);

      return { message: '등록이 완료되었습니다.' };
    } else {
      if (difDay < 0)
        throw new UnauthorizedException('시작일은 현재보다 미래여야 합니다.');

      let result = getDate(fixStart);
      if (result === '토' || result === '일') {
        throw new UnauthorizedException('공휴일은 연차 소진을 할 수 없습니다.');
      }

      if (canAnnual.annual === 0) {
        throw new UnauthorizedException('연차를 모두 소진 하였습니다.');
      } else if (canAnnual.annual < useDay) {
        throw new UnauthorizedException(
          '사용 할 수 있는 연차를 초과하였습니다.',
        );
      }

      firstMonth = await allVacation(startYear, startMonth);
      getHoliday(firstMonth);

      if (holidayList.length > 0) {
        for (const a of holidayList) {
          if (a === new Date(fixStart).toISOString().split('T')[0]) {
            throw new UnauthorizedException(
              '공휴일은 연차 소진을 할 수 없습니다.',
            );
          }
        }
      }

      const vacation = await this.vacationRepository.findOne({
        where: { userId: userId, start: fixStart, status: '사용전' },
      });

      const amongVacation = await this.vacationRepository.findOne({
        where: {
          userId: userId,
          end: MoreThan(fixStart),
          start: LessThan(fixStart),
        },
      });

      if (vacation) {
        throw new UnauthorizedException('동일한 휴가가 존재 합니다.');
      }

      if (amongVacation)
        throw new UnauthorizedException('휴가 일정이 중복됩니다.');

      kinds = useDay === 0.5 ? '반차' : '반반차';

      let newVacation = new Vacation();

      newVacation.userId = userId;
      newVacation.comment = comment;
      newVacation.start = fixStart;
      newVacation.useDay = useDay;
      newVacation.kinds = kinds;

      await this.vacationRepository.save(newVacation);

      canAnnual.annual = canAnnual.annual - useDay;

      await this.userRepository.save(canAnnual);
      return { message: '등록이 완료되었습니다.' };
    }
  }

  async findAll(id: number) {
    let now = new Date();

    const vacation = await this.vacationRepository.find({
      where: { userId: id },
    });
    if (vacation.length === 0) {
      throw new UnauthorizedException('등록된 휴가가 없습니다.');
    }

    for (const a of vacation) {
      let differentStart = getDifference(a.start, now);

      if (differentStart === 0 || differentStart > 0) {
        if (a.kinds === '연차') {
          let differentEnd = getDifference(a.end, now);
          if (differentEnd > 0) {
            a.status = '종료';
            await this.vacationRepository.save(a);
          } else {
            a.status = '사용중';
            await this.vacationRepository.save(a);
          }
        } else {
          if (differentStart > 0) {
            a.status = '종료';
            await this.vacationRepository.save(a);
          } else {
            a.status = '사용중';
            await this.vacationRepository.save(a);
          }
        }
      }
    }

    return vacation;
  }

  async findOne(id: number) {
    const vacation = await this.vacationRepository.findOne({
      where: { id: id },
    });
    console.log(vacation);
    if (!vacation) {
      throw new UnauthorizedException('존재 하지않는 휴가입니다.');
    }
    return vacation;
  }

  update(id: number, updateVacationDto: UpdateVacationDto) {
    return `This action updates a #${id} vacation`;
  }

  async remove(id: number) {
    const vacation = await this.vacationRepository.findOne({
      where: { id: id },
    });

    if (!vacation) {
      throw new UnauthorizedException('존재 하지않는 휴가입니다.');
    }

    if (vacation.status === '사용전') {
      let canAnnual = await this.userRepository.findOne({
        where: { id: vacation.userId, deleted: false },
      });

      canAnnual.annual = canAnnual.annual + vacation.useDay;

      await this.userRepository.save(canAnnual);

      await this.vacationRepository.delete({ id: id });
      return { message: '삭제가 완료 되었습니다.' };
    }

    throw new UnauthorizedException(
      '시작하였거나 끝난 연차는 취소 할 수 없습니다.',
    );
  }
}
