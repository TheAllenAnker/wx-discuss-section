const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    user_id: null,
    answers: []
  },

  onLoad: function (options) {
    var user_id = ""
    this.setPageData(user_id)
  },

  onReachBottom: function () {
    wx.showNavigationBarLoading();
    var that = this;
    setTimeout(function () {
      wx.hideNavigationBarLoading();
      that.nextLoad();
    }, 1000);
  },

  nextLoad: function () {
    console.log("gettingMoreData");
    var user_id = this.data.user_id
    var that = this
    if(this.data.answers.length < 40) {
      var curr_length = this.data.answers.length
      console.log(curr_length)
      var limit = 40 - curr_length >= 8 ? 8 : 40 - curr_length
      console.log(limit)
      db.collection('answers').skip(curr_length).limit(limit).where({
        'user_id': user_id
      }).get({
        success(res) {
          console.log(res.data)
          if (res.data.length != 0) {
            var curr_answers = that.data.answers.concat(res.data)
            that.setData({
              // concat data after current data
              answers: curr_answers
            });
          }
        }
      })
    }
  },

  setPageData: function (user_id) {
    var that = this
    db.collection("answers").where({
      'user_id': user_id
    }).limit(8).orderBy("date", "desc").get({
      success(res) {
        console.log(res.data)
        that.setData({
          answers: res.data
        })
      }
    })
  },

  toAnswerDetail: function() {

  }
})