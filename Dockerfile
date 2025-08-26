FROM ruby:3.0-alpine

# Install dependencies
RUN apk add --no-cache \
    build-base \
    git \
    nodejs \
    npm

WORKDIR /srv/jekyll

# Copy Gemfile
COPY Gemfile* /srv/jekyll/

# Install Jekyll 3.10 and other gems
RUN gem install bundler && \
    bundle install

EXPOSE 4000

ENTRYPOINT ["jekyll", "serve"]
CMD ["-H", "0.0.0.0", "--force_polling"]
