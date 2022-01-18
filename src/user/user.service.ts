import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { Repository } from 'typeorm';

import bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async createUser(email: string, nickname: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email, deleted: false },
    });
    if (user) {
      throw new UnauthorizedException('이미 존재하는 사용자 입니다.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await this.usersRepository.save({
      email,
      nickname,
      password: hashedPassword,
    });

    return { message: '회원가입이 완료되었습니다.' };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'nickname'],
    });
    if (!user) {
      throw new UnauthorizedException('존재하지 않는 유저 입니다.');
    }

    const result = await bcrypt.compare(password, user.password);
    if (result) {
      let today = new Date();

      let month = ('0' + (today.getMonth() + 1)).slice(-2);
      let day = ('0' + today.getDate()).slice(-2);
      let dateString = month + '-' + day;

      if (dateString === '01-01') {
        user.annual = 15;
        let newUser = await this.usersRepository.save(user);
        const { id, ...other } = newUser;
        return { id: id };
      }
      const { id, ...other } = user;
      return { id: id };
    }
    throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
  }
}
