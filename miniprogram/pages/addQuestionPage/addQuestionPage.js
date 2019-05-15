const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    questionTitle: null,
    questionDesc: null
  },

  onLoad: function (options) {
    this.setData({
    })
  },

  commitQuestion: function (options) {
    console.log("Committing Question")
    var that = this
    db.collection('questions').add({
      data: {
        content: that.data.questionTitle,
        desc: that.data.questionDesc,
        date: new Date(),
        user_id: ""//that.data.userInfo._id
      },
      success(res) {
        console.log(res)
        var pages = getCurrentPages()
        var prevPage = pages[pages.length - 2]
        prevPage.setData({
          refresh_question: true
        })
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },

  cancelQuestion: function (options) {
    console.log("Canceling Question")
    wx.showModal({
      title: '提示',
      content: '确认取消提问？',
      success(res) {
        if (res.confirm) {
          wx.navigateBack({
            delta: 1
          })
        } else {
          console.log("Continue editing question")
        }
      }
    })
  },

  titleInput: function (e) {
    this.setData({
      questionTitle: e.detail.value
    })
  },

  descInput: function (e) {
    this.setData({
      questionDesc: e.detail.value
    })
  }
})