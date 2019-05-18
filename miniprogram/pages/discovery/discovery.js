//discovery.js
const db = wx.cloud.database()
const app = getApp()
var user = null

Page({
  data: {
    navTab: ["推荐", "问题", "收藏"],
    currentNavtab: "0",
    imgUrls: [
      '../../images/swiper1.jpg',
      '../../images/swiper2.jpg',
      '../../images/swiper3.jpg'
    ],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    curr_user: null,
    feeds: [],
    questions: [],
    collection: [],
    feed_VOs: [],
    question_VOs: [],
    collection_VOs: [],
    emptyMoreData: false
  },

  onLoad: function() {
    console.log('onLoad')
    this.refresh();
  },

  onShow: function() {
    console.log('onShow')
    var pages = getCurrentPages()
    var curr_page = pages[pages.length - 1]
    if (curr_page.data.refresh_question) {
      this.getQuestionsData()
    }
    //调用应用实例的方法获取全局数据
  },

  onReachBottom: function() {
    wx.showNavigationBarLoading();
    var that = this;
    setTimeout(function() {
      wx.hideNavigationBarLoading();
      that.nextLoad();
    }, 1000);
  },

  switchTab: function(e) {
    this.setData({
      currentNavtab: e.currentTarget.dataset.idx
    });
  },

  toAnswerDetail: function(e) {
    wx.navigateTo({
      url: '../answer/answer?aid=' + e.currentTarget.dataset.aid
    })
  },
  // navigate to the question detail page to view/add answers
  toQuestionDetail: function(e) {
    wx.navigateTo({
      url: '../question/question?qid=' + e.currentTarget.dataset.qid
    })
  },

  // load discovery data
  refresh: function() {
    this.getDiscoveryData()
  },

  setFeedVOs: function(feeds) {
    this.setData({
      feed_VOs: []
    })
    console.log(feeds)
    var that = this
    var index = 0
    for (var i = 0; i < feeds.length; i++) {
      var answer = feeds[i]
      console.log(answer)
      db.collection("users").where({
        "_id": answer.user_id
      }).get({
        success(res) {
          var user = res.data[0]
          var feed_VOs = that.data.feed_VOs
          var feedVO = {
            "answer": feeds[index++],
            "user": user
          }
          feed_VOs.push(feedVO)
          that.setData({
            feed_VOs: feed_VOs
          })
        }
      })
    }

    console.log(that.data.feed_VOs)
  },

  setQuestionVOs: function(questions) {
    this.setData({
      question_VOs: []
    })
    var that = this
    var index = 0
    for (var i = 0; i < questions.length; i++) {
      var question = questions[i]
      db.collection("users").where({
        "_id": question.user_id
      }).get({
        success(res) {
          var user = res.data[0]
          var question_VOs = that.data.question_VOs
          var questionVO = {
            "question": questions[index++],
            "user": user
          }
          question_VOs.push(questionVO)
          that.setData({
            question_VOs: question_VOs
          })
        },
        fail(res) {
          var question_VOs = that.data.question_VOs
          var questionVO = {
            "question": question,
            "user": {
              "avatar": "anonymous_avatar_path",
              "username": "Anonymous User"
            }
          }
          question_VOs.push(questionVO)
          that.setData({
            question_VOs: question_VOs
          })
        }
      })
    }

    console.log(that.data.question_VOs)
  },

  // 设置用户收藏的回答数据
  setCollectionVOs: function(collection) {
    this.setData({
      collection_VOs: []
    })
    var that = this
    for (var i = 0; i < collection.length; i++) {
      var answer_id = collection[i].answer_id
      db.collection("answers").where({
        "_id": answer_id
      }).get({
        success(res) {
          var answer = res.data[0]
          var question_id = answer.question_id
          db.collection("questions").where({
            "_id": question_id
          }).get({
            success(res) {
              var collection_VOs = that.data.collection_VOs
              var collectionVO = {
                "answer": answer,
                "question": res.data[0]
              }
              collection_VOs.push(collectionVO)
              that.setData({
                collection_VOs: collection_VOs
              })
            }
          })
        }
      })
    }

    console.log(this.data.collection_VOs)
  },

  getDiscoveryData: function() {
    // 获取推荐数据
    this.getFeedsData()
    // 获取问题数据
    this.getQuestionsData()
    // 获取用户收藏数据
    this.getCollectionData()
  },

  getFeedsData: function() {
    var that = this
    db.collection('answers').limit(2).get({
      success(res) {
        console.log(res.data)
        that.setData({
          feeds: res.data
        })
        that.setFeedVOs(res.data)
      }
    })
  },

  getQuestionsData: function() {
    var that = this
    db.collection("questions").limit(8).orderBy("date", "desc").get({
      success(res) {
        console.log(res.data)
        that.setData({
          questions: res.data
        })
        that.setQuestionVOs(res.data);
      }
    })
  },

  getCollectionData: function() {
    var that = this
    db.collection("collection").limit(8).where({
      "user_id": app.user_id
    }).orderBy("date", "desc").get({
      success(res) {
        console.log(res.data)
        that.setData({
          collection: res.data
        })
        that.setCollectionVOs(res.data);
      }
    })
  },

  // load more discovery data
  nextLoad: function() {
    this.getMoreDiscoveryData();
    console.log("gettingMoreData");
  },

  getMoreDiscoveryData: function() {
    var currentTab = this.data.currentNavtab
    var that = this
    switch (currentTab) {
      case "0":
        if (that.data.feed_VOs.length < 40) {
          that.getMoreFeedData()
        }
        break
      case "1":
        if (that.data.question_VOs.length < 40) {
          that.getMoreQuestionData()
        }
        break
      case "2":
        if (that.data.collection_VOs.length < 40) {
          that.getMoreCollectionData()
        }
        break
    }
  },

  getMoreFeedData: function() {
    console.log("Getting more feed data")
    var that = this
    var curr_length = this.data.feeds.length
    console.log(curr_length)
    var limit = 40 - curr_length >= 8 ? 8 : 40 - curr_length
    console.log(limit)
    db.collection('answers').skip(curr_length).limit(limit).get({
      success(res) {
        console.log(res.data)
        if (res.data.length != 0) {
          var curr_feeds = that.data.feeds.concat(res.data)
          that.setFeedVOs(curr_feeds)
          that.setData({
            // concat data after current data
            feeds: curr_feeds
          });
        }
      }
    })
  },

  getMoreQuestionData: function() {
    console.log("Getting more question data")
    var that = this
    var curr_length = this.data.questions.length
    console.log(curr_length)
    var limit = 40 - curr_length >= 8 ? 8 : 40 - curr_length
    console.log(limit)
    db.collection('questions').skip(curr_length).limit(limit).orderBy("date", "desc").get({
      success(res) {
        console.log(res.data)
        var curr_questions = that.data.questions.concat(res.data)
        that.setQuestionVOs(curr_questions)
        that.setData({
          // concat data after current data
          questions: curr_questions
        });
      }
    })
  },

  getMoreCollectionData: function() {
    console.log("Getting more collection data")
    var that = this
    var curr_length = this.data.collection.length
    console.log(curr_length)
    var limit = 40 - curr_length >= 8 ? 8 : 40 - curr_length
    console.log(limit)
    db.collection("collection").limit(8).where({
      "user_id": app.user_id
    }).orderBy("date", "desc").get({
      success(res) {
        console.log(res.data)
        var curr_collection = that.data.collection.concat(res.data)
        that.setCollectionVOs(curr_collection)
        that.setData({
          // concat data after current data
          collection: curr_collection
        });
      }
    })
  },

  toAddQuestionPage: function() {
    console.log("Adding a question")
    wx.navigateTo({
      url: '../addQuestionPage/addQuestionPage',
    })
  }
});