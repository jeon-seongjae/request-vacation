nestjs를 통해 구현

클론을 받으셨다면 npm install을 하신 후 .env 파일을 생성하여 DB_USERNAME , DB_PASSWORD, DB_DATABASE , PORT를 지정해주세요 database는 원하시는 이름으로 생성하셔서 이름을 넣으면 자동으로 테이블을 생성합니다! 단, npm start를 하기전에 ormconfig.ts로 가셔서 최초 연결 한 번만 synchronize: false => synchronize: true 바꿔주세요 설정하지 않을시 데이터베이스 테이블 자동 생성이 안됩니다! 처음 연동 후에는 다시 false로 바꾸고 계속 실행하시면 됩니다.

- 기본적인 API는 구동하신 port/api가시면 확인 할 수 있습니다. ex)) http://localhost:3000/api/
- 회원가입과 로그인이 구현되어있습니다. 회원가입은 정말 단순한 가입만 구현했습니다.
- 회원가입시 연차는 기본 15일이 주어집니다.
- 휴가 목록 API 호출시 user고유 아이디에 해당하는 모든 휴가를 리턴 합니다.
- 클라이언트에서 오는 useDay는 연차 종류를 가리기 위한 flag사용되고 실제 DB에 저장되는 useDay는 휴가일을 계산해서 저장합니다.
- 년이 갱신 될 시 기존 연차를 모두 날리고 15일을 채우는 형식으로 만들었습니다.
- 휴사 상태는(status) '사용전', '사용중', '종료' 이렇게 3가지로 나뉩니다.
