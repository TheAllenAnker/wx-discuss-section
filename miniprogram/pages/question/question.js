//answer.js
const util = require('../../utils/util.js')
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    motto: 'Discovery Question',
    answers: [],
    user: null,
    question: null
  },
  //事件处理函数
  bindItemTap: function(options) {
    wx.navigateTo({
      url: '../answer/answer?aid=' + options.aid
    })
  },

  onLoad: function (options) {
    var question_id = options.qid
    this.setData({
      qid: question_id
    })
  },

  onShow: function(options) {
    this.setData({
      answers: []
    })
    this.setPageData(this.data.qid)
  },

  toAnswerDetail: function (e) {
    wx.navigateTo({
      url: '../answer/answer?aid=' + e.currentTarget.dataset.aid
    })
  },

  setPageData: function(question_id) {
    var that = this
    console.log(question_id)
    db.collection("questions").where({
      "_id": question_id
    }).get({
      success(res) {
        var question = res.data[0]
        var user_id = question.user_id
        that.setData({
          question: question
        })
        db.collection("users").where({
          "_id": user_id
        }).get({
          success(res) {
            that.setData({
              user: res.data[0]
            })
          }
        })
      }
    })

    db.collection("answers").where({
      'question_id': question_id
    }).get({
      success(res) {
        console.log(res.data)
        that.setAnswersData(res.data)
      }
    })
  },

  setAnswersData: function(answer_list) {
    var that = this
    var index = 0
    for (var i = 0; i < answer_list.length; i++) {
      var answer = answer_list[i]
      db.collection("users").where({
        "_id": answer.user_id
      }).get({
        success(res) {
          var user = res.data[0]
          var answers = that.data.answers
          var answerVO = {
            "answer": answer_list[index++],
            "user": user
          }
          answers.push(answerVO)
          that.setData({
            answers: answers
          })
        }
      })
    }

    console.log(that.data.answers)
  },

  toWriteAnswer: function(options) {
    var that = this
    wx.navigateTo({
      url: '../writeAnswerPage/writeAnswer?qid=' + that.data.question._id
    })
  }
})
