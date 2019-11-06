
const app = getApp()
const utils = require('../../utils/util.js')
Page({
    data: {
        loginState: false,
        loginInfo: '',
        inforList: [],
        todoList: [],
        page: 1,
        todoPage: 1,
        pageSize: 10,
        dataState: true,
        //1代表全部  2代表待办
        showType: 1,
        todoNumber: 0,
        totalPages: 100,
        todoPages: 100
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //用户登录了
        var that = this;
        if (app.globalData.loginInfo != null && app.globalData.loginInfo != '') {
            this.setData({
                loginState: true,
                loginInfo: app.globalData.loginInfo
            })
            // this.getNewInboxNumber();
        }
        setInterval(function() {
            that.setData({
                todoNumber: app.globalData.todoNumber
            })
        }, 2000)
    },
    onShow: function() {
        if (app.globalData.loginInfo != null && app.globalData.loginInfo != '') {
            if (this.data.showType == 1) {
                this.setData({
                    loginState: true,
                    loginInfo: app.globalData.loginInfo,
                    todoPage: 1,
                    todoList: [],
                    page: 1,
                    todoNumber: app.globalData.todoNumber
                })
                this.dataList();
            } else {
                this.setData({
                    loginState: true,
                    loginInfo: app.globalData.loginInfo,
                    page: 1,
                    todoPage: 1,
                    inforList: [],
                    todoNumber: app.globalData.todoNumber
                })
                this.getTODOInbox();
            }
            utils.getNewInboxNumber();
        }
    },
    onPullDownRefresh: function() {
        dd.stopPullDownRefresh();
        if (this.data.showType == 1) {
            this.setData({
                inforList: [],
                dataState: true,
                page: 1
            })
            this.dataList();
        } else {
            this.setData({
                todoList: [],
                dataState: true,
                todoPage: 1
            })
            this.getTODOInbox();
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.dataState) {
            if (this.data.showType == 1) {
                if (this.data.page <= this.data.totalPages) {
                    this.dataList();
                }
            } else {
                if (this.data.todoPage <= this.data.todoPages) {
                    this.getTODOInbox();
                }
            }
        }
    },
    onShareAppMessage: function() {
        return {
            imageUrl: '../../images/common/sharepic.png'
        }
    },

    //请求全部消息列表
    showAllInbox: function() {
        var that = this;
        that.setData({
            showType: 1,
            page: 1,
        })
        // if (that.data.inforList.length == 0) {
        that.dataList();
        // }
    },

    //请求待办消息列表
    showUnreadInbox: function() {
        var that = this;
        that.setData({
            showType: 2,
            todoPage: 1,
        })
        // if (that.data.todoList.length == 0) {
        that.getTODOInbox();
        // }
    },

    dataList: function() {
        var that = this;
        // 请求数据中的加载效果
        dd.showLoading({
            title: '加载中...',
        })
        utils.getNewInboxNumber();
        var sendData = {}
        var callBack = {
            success: function(e) {
                dd.stopPullDownRefresh() //停止下拉刷新
                dd.hideLoading();
                that.setData({
                    todoNumber: app.globalData.todoNumber
                })
                if (that.data.page == 1) {
                    that.setData({
                        inforList: []
                    })
                }
                var readList = [];
                var list = that.data.inforList;
                if (e.data.status == '0000') {
                    for (var i = 0; i < e.data.res_data.list.length; i++) {
                        if (e.data.res_data.list[i].read == 1 && e.data.res_data.list[i].emsAttr == 1) { //未读请求
                            readList.push(e.data.res_data.list[i].emsId);
                        }
                        list.push(e.data.res_data.list[i]);
                    }
                    if (readList.length > 0) {
                        that.readAjax(readList);
                    }
                    that.setData({
                        inforList: list
                    })
                    if (e.data.res_data.list.length < that.data.pageSize) {
                        that.setData({
                            dataState: false,
                        })
                    } else {
                        var pages = e.data.res_data.pages;
                        that.setData({
                            dataState: true,
                            page: that.data.page + 1,
                            totalPages: pages
                        })
                    }
                } else {
                    utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                dd.stopPullDownRefresh() //停止下拉刷新
                dd.hideLoading();

                utils.showToast(e.data.message, 1000);
            }
        }
        var url = '/emsInfo/' + that.data.page + '/' + that.data.pageSize;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    readAjax: function(data) {
        var that = this;
        var sendData = {
            emsIdList: data
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    console.log('成功了')
                    that.setData({
                        todoNumber: app.globalData.todoNumber
                    })
                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.data.message, 1000);
            }
        }
        var url = '/emsInfo';
        utils.ajax(utils.setURL(url), sendData, callBack, 'PUT');
    },
    listClick: function(e) {
        if (e.currentTarget.dataset.type == 1 || e.currentTarget.dataset.type == 10) { //会议
            dd.navigateTo({
                url: '../schedule/scheduleDetail/scheduleDetail?tabType=0&id=' + e.currentTarget.dataset.id,
            })
        }
    },
    agreeClick: function(e) {
        var type = e.currentTarget.dataset.type;
        var emsId = e.currentTarget.dataset.id;
        var relId = e.currentTarget.dataset.relid;
        var that = this;
        var sendData = {
            emsId: emsId,
            type: type,
            relId: relId
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    utils.showToast(e.data.message, 1000);
                    if (that.data.showType == 1) {
                        that.setData({
                            page: 1,
                            todoNumber: app.globalData.todoNumber
                        })
                        that.dataList();
                    } else {
                        that.setData({
                            todoPage: 1,
                            todoNumber: app.globalData.todoNumber
                        })
                        that.getTODOInbox();
                    }
                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.data.message, 1000);
            }
        }
        var url = '/conference/updateConferee?bookId=' + relId + '&emsId=' + emsId + '&joinStatus=' + type;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    companyClick: function(e) {
        var type = e.currentTarget.dataset.type;
        var emsId = e.currentTarget.dataset.id;
        var relId = e.currentTarget.dataset.relid;
        var that = this;
        var sendData = {
            emsId: emsId,
            joinStatus: type,
            relId: relId
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    utils.showToast(e.data.message, 1000);
                    if (that.data.showType == 1) {
                        that.setData({
                            page: 1,
                            todoNumber: app.globalData.todoNumber
                        })
                        that.dataList();
                    } else {
                        that.setData({
                            todoPage: 1,
                            todoNumber: app.globalData.todoNumber
                        })
                        that.getTODOInbox();
                    }
                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.data.message, 1000);
            }
        }
        var url = '/companies/updateJoinCompany?relId=' + relId + '&emsId=' + emsId + '&joinStatus=' + type;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    //获取待办列表
    getTODOInbox: function() {
        var that = this;
        dd.showLoading({
            title: '加载中...',
        })
        utils.getNewInboxNumber();
        var sendData = {}
        var callBack = {
            success: function(e) {
                dd.stopPullDownRefresh() //停止下拉刷新
                dd.hideLoading();
                that.setData({
                    todoNumber: app.globalData.todoNumber
                })
                if (that.data.todoPage == 1) {
                    that.setData({
                        todoList: []
                    })
                }

                var list = that.data.todoList;
                if (e.data.status == '0000') {
                    for (var i = 0; i < e.data.res_data.list.length; i++) {
                        list.push(e.data.res_data.list[i]);
                    }
                    var number = list.length;
                    that.setData({
                        todoList: list,
                    })
                    if (e.data.res_data.list.length < that.data.pageSize) {
                        that.setData({
                            dataState: false,
                        })
                    } else {
                        var pages = e.data.res_data.pages;

                        that.setData({
                            dataState: true,
                            todoPage: that.data.todoPage + 1,
                            todoPages: pages
                        })
                    }

                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                dd.stopPullDownRefresh() //停止下拉刷新
                dd.hideLoading();

                utils.showToast(e.data.message, 1000);
            }
        }
        var url = '/emsInfo/todo/' + that.data.todoPage + '/' + that.data.pageSize;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    getNewInboxNumber: function() {
        var that = this;
        //长链接
        var baseUrl = utils.setURL('');
        baseUrl = baseUrl.split('//')[1]
        dd.connectSocket({
            url: 'wss://' + baseUrl + '/websocket/' + that.data.loginInfo.userId + '/' + that.data.loginInfo.companyId
        })
        dd.onSocketOpen(function(res) {
            console.log(res);
        })
        dd.onSocketMessage(function(res) {
            var dataDict = JSON.parse(res.data);
            if (dataDict.code == 1001) {
                var dataDict = dataDict.data;
                var number = dataDict.todoCount;
                that.setData({
                    todoNumber: number
                })
                console.log("消息：" + number);
                console.log(dataDict)
                if (that.data.todoNumber > 0) {
                    var todoNo = that.data.todoNumber.toString();
                    dd.setTabBarBadge({
                        index: 3,
                        text: todoNo,
                    })
                } else {
                    dd.removeTabBarBadge({
                        index: 3,
                    })
                }
            } else if (dataDict.code == 1002) {
                var number = dataDict.data;
                that.setData({
                    todoNumber: number
                })
                if (that.data.todoNumber > 0) {
                    var todoNo = that.data.todoNumber.toString();
                    dd.setTabBarBadge({
                        index: 2,
                        text: todoNo,
                    })
                } else {
                    dd.removeTabBarBadge({
                        index: 2,
                    })
                }
            }
        })
        dd.onSocketClose(function(res) {
            var baseUrl = utils.setURL('');
            baseUrl = baseUrl.split('//')[1]
            dd.connectSocket({
                url: 'wss://' + baseUrl + '/websocket/' + that.data.loginInfo.userId + '/' + that.data.loginInfo.companyId
            })
        })
    },
    saveEmsReleaseStatus: function(e) {
        var id = e.currentTarget.dataset.id;
        var emsid = e.currentTarget.dataset.emsid;
        var type = e.currentTarget.dataset.type;
        var that = this;
        var sendData = {};
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    that.setData({
                        inforList: [],
                        dataState: true,
                        page: 1,
                        todoNumber: app.globalData.todoNumber
                    })
                    var readList = [];
                    readList.push(emsid);
                    that.readAjax(readList);
                    that.dataList();
                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.data.message, 1000);
            }
        }
        var url = '/meetingRelease/saveEmsReleaseStatus/' + id + '/' + emsid + '/' + type
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    }
})