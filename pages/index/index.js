//index.js
var AV = require('../../libs/av-weapp-min.js');
//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {},
    playList: [],
    noData: false
  },
  onShareAppMessage: function () {
    return {
      title: '看剧小助手',
      desc: '轻松记录看剧进度 剧集更新早知道',
      path: 'pages/index/index'
    }
  },
  //事件处理函数
  openConfig: function(data) {

    wx.navigateTo({
      url: '../logs/logs?id=' + data.currentTarget.id
    })
  },
  addNew: function () {
    var self = this;

    self.animationAddOne.rotate(0).step();
    self.setData({
      animationAddOneData: self.animationAddOne.export()
    })
    setTimeout(function() {
      wx.navigateTo({
        url: '../logs/logs'
      })
    }, 400)
    
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this

    // 登录并同步微信数据
    app.getUserInfo().then(function (userInfo) {
      wx.getUserInfo({
        success: ({userInfo}) => {
          // 更新当前用户的信息
          console.log('===wx.getUserInfo===')
          AV.User.current().set(userInfo).save().then(user => {
            // 成功，此时可在控制台中看到更新后的用户信息
            console.log('=======')
            console.log('onjectId ' + user.toJSON().objectId)
          }).catch(console.error);
        }
      });
      
    })
  },
  toggleView: function (e) {
    let self = this;
    let index = e.currentTarget.id;
    let toggleStatus = self.data.playList[index].toggle;
    let param = 'playList[' + index + '].toggle';
    let obj = {};
    obj[param] = !toggleStatus;
    self.setData(obj);

  },
  onShow: function () {
    console.log('onshow')
    var self = this;
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 10000
    })
    // var query = new AV.Query('TvPlay');

    // 每次进入index的时候进行数据的加载
    app.getUserInfo().then(function (userInfo) {
      new AV.Query('TvPlay')
        .equalTo('user', userInfo.objectId)
        .descending('updatedAt')
        .find()
        .then(function (todo) {
          console.log(todo)
          console.log('==查询TvPlay对象 成功==')
          if (todo.length > 0) {
            wx.hideToast();
            console.log('====成功查询到user的剧集对象===')
            var noData = (todo[0].get('list').length) > 0 ? false : true;
          
            self.setData({
              noData: noData,
              playList: todo[0].get('list')
            })
          } else {
            console.log('==新建TvPlay对象的实例==')
            // 新建对象
            var tvPlay = new app.globalData.TvPlayClass();
            // 设置用户名
            tvPlay.set('user', userInfo.objectId);
            // 设置剧列表
            tvPlay.set('list', wx.getStorageSync('tv_play').list || []);
            tvPlay.save().then(function (todo) {
              console.log('==新创建TvPlay对象实例成功，写入一个用户的数据，并展示==');
              wx.hideToast();
              self.setData({
                noData: todo.get('list').length > 0 ? false : true,
                playList: todo.get('list')
              })
            }, function (error) {
              console.error(error);
              wx.hideToast();
              var tvPlay = new app.globalData.TvPlayClass();
              // 设置用户名
              tvPlay.set('wrongUser', userInfo.objectId);
              // 设置剧列表
              tvPlay.set('wrongInfo', error);
              tvPlay.save().then(function (todo) {
                console.log('==新创建TvPlay对象实例成功，写入一个用户的数据，并展示==');
                
                wx.showToast({
                  title: '网络错误 请重新进入看剧小助手...',
                  duration: 10000
                })
              }, function (error) {
                console.error(error);
                
              });
            });
          }
          
          
        }, function () {
          console.log('==查询TvPlay对象失败==')
          
        });
        
    })
    

    // 新增记录按钮动画
    var animationAddOne = wx.createAnimation({
      duration: 400,
        timingFunction: 'ease-in-out',
    })
    self.animationAddOne = animationAddOne;
    setTimeout(function () {
      animationAddOne.rotate(360).step();
      self.setData({
        animationAddOneData: animationAddOne.export()
      })
    }, 1000)
    
  }
})
