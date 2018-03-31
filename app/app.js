
module.exports = app => {
  app.beforeStart(async () => {
    const ctx = app.createAnonymousContext();
  });
  ctx.logger.debug('server running at: ' + app.config.cluster.listen.hostname + ':' + app.config.cluster.listen.port );

};