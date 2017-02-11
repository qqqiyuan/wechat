//app.js
var AV = require('./libs/av-weapp-min.js');
var config = require('./config.js');
console.log(config)
AV.init({
  appId: config.appId,
  appKey: config.appKey,
});
App({
  onLaunch: function () {
    var self = this;

    self.globalData.TvPlayClass =  AV.Object.extend('TvPlay');
  },
  getUserInfo:function(){
    var that = this;
  
    return AV.Promise.resolve(AV.User.current()).then(user =>
      user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
    ).then(user =>
      user ? user : AV.User.loginWithWeapp()
    ).then((user) => {
      console.log('==app.js getUserInfo===')
      that.globalData.userInfo = user.toJSON();
      return user.toJSON();
    }).catch(error => console.error(error.message));
  },
  globalData:{
    playList: [],
    userInfo: {},
    TvPlayClass: null
  }
})