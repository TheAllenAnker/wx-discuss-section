//answer.js
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    motto: 'Discovery Answer',
    aid: null,
    qid: null,
    answer: null,
    liked: false,
    upvoteImagePath: null,
    upvotes: 0
  },

  onLoad: function(options) {
    console.log('onLoad')
    var aid = options.aid
    this.setData({
      aid: aid
    })
    var that = this
    db.collection('answers').where({
      '_id': aid
    }).get({
      success(res) {
        var answer = res.data[0]
        db.collection("users").where({
          "_id": answer.user_id
        }).get({
          success(res) {
            var user = res.data[0]
            that.setData({
              user: user,
              answer: answer,
              upvotes: answer.upvotes
            })
          }
        })
      }
    })

    db.collection('answers').where({
      'user_id': "",
      "answer_id": aid
    }).get({
      success(res) {
        that.setData({
          liked: true
        })
      }
    })
  },

  onShow: function() {
    var liked = this.data.liked
    this.setData({
      oldStatus: liked
    })
    if (liked) {
      this.setData({
        upvoteImagePath: "../../images/liked.png"
      })
    } else {
      this.setData({
        upvoteImagePath: "../../images/unliked.png"
      })
    }
  },

  onHide: function() {
    var liked = this.data.liked
    var that = this
    // like status changed
    if (this.data.oldStatus != liked) {
      // used to like, but dislike now
      if (liked) {
        db.collection('liked').where({
          "answer_id": that.data.aid,
          "user_id": ""
        }).remove({
          success(res) {
            console.log(res.data)
          }
        })
      } else {
        // like now
        db.collection('liked').add({
          data: {
            "answer_id": that.data.aid,
            "user_id": ""
          },
          success(res) {
            console.log(res)
          }
        })
      }
    }
  },

  //事件处理函数
  toQuestionDetail: function() {
    wx.navigateTo({
      url: '../question/question?qid=' + this.data.qid
    })
  },

  upvoteAnswer: function(e) {
    console.log("upvoteAnswer")
    var liked = this.data.liked
    var that = this
    this.setData({
      liked: !liked
    })
    liked = !liked
    var currUpvotes = this.data.upvotes
    if (liked) {
      this.setData({
        upvoteImagePath: "../../images/liked.png",
        upvotes: currUpvotes + 1
      })
    } else {
      this.setData({
        upvoteImagePath: "../../images/unliked.png",
        upvotes: currUpvotes - 1
      })
    }

    var answer_id = this.data.aid
    console.log(answer_id)
    console.log(that.data.upvotes)
    db.collection('answers').doc(answer_id).update({
      data: {
        upvotes: that.data.upvotes
      },
      success(res) {
        console.log(res)
      }
    })
  },

  starAnswer: function(e) {
    console.log("starAnswer")
  },

  commentAnswer: function(e) {
    console.log("commentAnswer")
  }
})