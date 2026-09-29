FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.http.conf /etc/nginx/templates/nginx.http.conf
COPY nginx.ssl.conf /etc/nginx/templates/nginx.ssl.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
