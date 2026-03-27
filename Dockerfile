# Nginx 기반 경량 이미지
FROM --platform=linux/amd64 nginx:alpine

# 기본 설정 삭제 및 커스텀 설정 복사
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/

# 소스 코드 복사
COPY . /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
