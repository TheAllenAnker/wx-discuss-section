const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    qid: null,
    answerContent: null
  },

  onLoad: function(options) {
    this.setData({
      qid: options.qid
    })
  },

  commitAnswer: function(options) {
    console.log("Committing Answer")
    var that = this
    var qid = that.data.qid
    console.log(qid)
    db.collection("questions").where({
      "_id": qid
    }).get({
      success(res) {
        console.log("Get Question Info Succeed")
        var question = res.data[0]
        db.collection('answers').add({
          data: {
            answer: that.data.answerContent,
            date: new Date(),
            question: question.content,
            question_id: qid,
            stars: 0,
            upvotes: 0,
            user_id: ""//userInfo._id
          },
          success(res) {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      }
    })
  },

  cancelAnswer: function(options) {
    console.log("Canceling Answer")
    wx.showModal({
      title: '提示',
      content: '确认取消回答？',
      success(res) {
        if (res.confirm) {
          wx.navigateBack({
            delta: 1
          })
        } else {
          console.log("Continue writting answer")
        }
      }
    })
  },

  textareaInput: function(e) {
    this.setData({
      answerContent: e.detail.value
    })
  }
})