FROM jekyll/jekyll:3.8
WORKDIR /srv/jekyll
COPY Gemfile /srv/jekyll

RUN bundle install

EXPOSE 4000
ENTRYPOINT ["jekyll", "serve"]
CMD ["-H", "0.0.0.0"]
