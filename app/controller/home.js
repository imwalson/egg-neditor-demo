'use strict';
const fs = require('fs');

module.exports = app => {
  class HomeController extends app.Controller {
    async index() {
      const ctx = this.ctx;
      await ctx.render('index.html', { });
    }


  }

  return HomeController;
};
