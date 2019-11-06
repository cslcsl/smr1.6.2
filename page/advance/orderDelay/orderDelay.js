const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bookId: '121',
        startDate: '2019-04-09 13:00:00',
        originDate: '2019-04-09 23:30:00',
        endDate: '2019-04-09 23:30:00',
        delayList1: [{
            code: '1',
            name: '30',
            state: true
        }, {
            code: '2',
            name: '60',
            state: false
        }],
        delayList2: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            bookId: options.bookId,
            startDate: options.startDate,
            endDate: options.endDate,
			originDate: options.endDate
        })
        this.endDate(30);
        this.dataList();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
    dataList: function() {
        var that = this;
        var sendData = {
            bookId: that.data.bookId,
			endDate: that.data.endDate,
			startDate: that.data.originDate
        }
        var callBack = {
            success: function(e) {
                //console.log(e.data.res_data);
                if (e.data.status == '0000') {
                    var delayList2 = [];
                    for (var i = 0; i < e.data.res_data.timeDelay.length; i++) {
						e.data.res_data.timeDelay[i].state = false;
                        delayList2.push(e.data.res_data.timeDelay[i])
                    }
                    for (var i = 0; i < e.data.res_data.noTimeDelay.length; i++) {
                        e.data.res_data.noTimeDelay[i].state = 3;
                        delayList2.push(e.data.res_data.noTimeDelay[i]);
                    }
                    that.setData({
                        delayList2: delayList2
                    })
                } else {
                    utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
            }
        }
		var url = '/meetingroom/meetingTimeDelay?bookId=' + that.data.bookId + '&endDate=' + that.data.endDate + '&startDate=' + that.data.originDate;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    userListClick: function(e) {
        var that = this;
        var type = e.currentTarget.dataset.type;
        var index = e.currentTarget.dataset.index;
        var state = e.currentTarget.dataset.state;
        if (type == 1) {
            for (var i = 0; i < that.data.delayList1.length; i++) {
                if (i == index) {
                    that.data.delayList1[i].state = true;
                } else {
                    that.data.delayList1[i].state = false;
                }
            }
            that.setData({
                delayList1: that.data.delayList1
            })
            that.endDate(that.data.delayList1[index].name);
            this.dataList();
        } else {
            if (state != 3) {
				if (state){
					that.data.delayList2[index].state =false;
				}else{
					that.data.delayList2[index].state = true;
				}    
            }
            that.setData({
                delayList2: that.data.delayList2
            })
        }
    },
    endDate: function(minNum) {
        var that = this;
        var begintime_ms = Date.parse(new Date(that.data.originDate.replace(/-/g, "/")));
        var date = (new Date(begintime_ms)); //开始时间
        var min = date.getMinutes(); //2. 获取当前分钟
        date.setMinutes(min + minNum); //3. 设置当前时间+10分钟：把当前分钟数+10后的值重新设置为date对象的分钟数
        var y = date.getFullYear();
        var m = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
        var d = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
        var h = date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours()
        var f = date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()
        var s = '00';
        var formatdate = y + '-' + m + '-' + d + " " + h + ":" + f + ":" + s;
        that.setData({
            endDate: formatdate
        })
    },
    confirmBtn: function() {
        var that = this;
        var meetingIds = [];
        for (var i = 0; i < that.data.delayList2.length; i++) {
            if (that.data.delayList2[i].state==true) {
                meetingIds.push(that.data.delayList2[i].productId);
            }
        }
        var sendData = {
            bookId: that.data.bookId,
            endTime: that.data.endDate,
			startTime: that.data.originDate,
            meetingIds: meetingIds
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
					dd.setStorageSync({key:'scheduleState',data:'2'})
                    dd.navigateBack({
                        delta: 1
                    })
                } else {
                    utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
            }
        }
        var url = '/conference/saveMeetingTimeDelay';
        utils.ajax(utils.setURL(url), sendData, callBack);
    }
})