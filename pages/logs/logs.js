//logs.js
var AV = require('../../libs/av-weapp-min.js');
var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    logs: [],
    play: {},
    isAdd: true,
    id: 0,
    timeList: [1, 2 ,3],
    nameFocus: false,
    playList: []
  },
  onLoad: function (option) {
    console.log('logs onload')
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 10000
    })
    var self = this;
    
    // 如果链接后有序号参数 则为修改
    if (option.id) {
      console.log('===修改剧的内容===')
      self.setData({
        isAdd: false,
        id: option.id
      })
      app.getUserInfo().then(function (userInfo) {
        new AV.Query('TvPlay')
          .equalTo('user', userInfo.objectId)
          .descending('updatedAt')
          .find()
          .then(function (todo) {
            console.log('====查询到TvPlay对象 成功===')
            wx.hideToast();
            console.log(todo)
            self.setData({
              play: todo[0].get('list')[option.id],
              playList: todo[0].get('list')
            })
          }, function () {

            console.log('==查询TvPlay对象 失败==')            
          });
          
      })
    } else {
      console.log('===新增一个剧===');
      app.getUserInfo().then(function (userInfo) {
        new AV.Query('TvPlay')
          .equalTo('user', userInfo.objectId)
          .descending('updatedAt')
          .find()
          .then(function (todo) {
            console.log('====查询到TvPlay对象 成功===')
            wx.hideToast();
            console.log(todo)
            self.setData({
              playList: todo[0].get('list')
            })
          }, function () {

            console.log('==查询TvPlay对象 失败==')            
          });
      })
    }
  },
  onReady: function () {
    var self = this;
    var list = [];
    for(var i = 0; i < 60; i++) {
      list.push(util.formatNumber(i))
    }
    self.setData({
      timeList: list
    })
  },
  bindNumChange: function (e) {
    var self = this;

    console.log(e)
    var index = e.currentTarget.id;
    var value = e.detail.value;
    switch(index) {
      case '0':
        self.setData({
          'play.hour': value
        })
      break;
      case '1':
        self.setData({
          'play.minute': value
        })
      break;
      case '2':
        self.setData({
          'play.second': value
        })
      break;
    } 
    
  },
  bindWatchEnd: function (e) {
    var self = this;

    self.setData({
      'play.watchEnd': e.detail.value
    })
  },
  savePlayInfor: function (e) {
    var self = this;

    if (e.detail.value.name.trim() == '') {
      return wx.showModal({
        title: '提示',
        content: '输入剧名',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            self.setData({
              nameFocus: true
            })
          }
        }
      })
    }
    wx.showToast({
      title: '保存中...',
      icon: 'loading',
      duration: 10000
    })
    // 如果是新增记录
    // 在localstorage中的list数组末尾添加一条记录
    if (self.data.isAdd) {
      console.log('==新增点击保存==')
      var list = self.data.playList;
      console.log('==点击保存时当前的数据列表==')
      console.log(list)
      list.push(e.detail.value);
      console.log('==点击保存后更新的数据列表==')
      console.log(list)
      
      ///
      new AV.Query('TvPlay')
        .equalTo('user', app.globalData.userInfo.objectId)
        .descending('updatedAt')
        .find()
        .then(function (todo) {
          console.log('====查询到TvPlay对象 成功===')
          console.log(todo)
          todo[0].set('list', list);
          todo[0].save().then(function (todo) {
            console.log('==更新数据库的数据 成功==')
            wx.hideToast();
            wx.navigateBack({
              delta: 1
            })
          }, function (error) {
            console.error(error);
          });
        }, function () {

          console.log('==查询TvPlay对象 失败==')            
        });
      
    } else {
      console.log('==修改点击保存==')
      var list = self.data.playList;
      list[self.data.id] = e.detail.value;
      console.log('==点击保存后更新的数据列表==')
      console.log(list)
      ///
      new AV.Query('TvPlay')
        .equalTo('user', app.globalData.userInfo.objectId)
        .descending('updatedAt')
        .find()
        .then(function (todo) {
          console.log('====查询到TvPlay对象 成功===')
          console.log(todo)
          todo[0].set('list', list);
          todo[0].save().then(function (todo) {
            console.log('==更新数据库的数据 成功==')
            wx.hideToast();
            wx.navigateBack({
              delta: 1
            })
          }, function (error) {
            console.error(error);
          });
        }, function () {

          console.log('==查询TvPlay对象 失败==')            
        });
    }

    
  }
})
