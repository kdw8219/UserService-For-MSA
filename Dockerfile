# 베이스 이미지
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install --production

# 소스 복사
COPY . .

# Nest.js 빌드 (tsc)
RUN npm run build

# 컨테이너 포트 명시
EXPOSE 3000

# 실행 명령어
CMD ["npm", "start"]

