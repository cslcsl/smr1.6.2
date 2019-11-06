const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderId: '',
        begintime: '',
        endtime: '',
        date: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            orderId: options.id,
            begintime: options.begin,
            endtime: options.end,
            date: options.date
        })
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
    btnClick: function(e) {
		var that=this;
        var type = e.currentTarget.dataset.type;
        if (type == 1) {
            dd.redirectTo({
                url: '../scheduleContact/scheduleContact?type=2&id=' + that.data.orderId + '&begin=' + that.data.begintime.replace(/:/g, '') + '&end=' + that.data.endtime.replace(/:/g, '') + '&date=' + that.data.date,
            })
        } else {
			dd.setStorageSync({key:'orderDataList', data:''})
			dd.setStorageSync({key:'stencilId', data:''});
			dd.setStorageSync({key:'selectPeopleList', data:[]});
			dd.setStorageSync({key:'hostPeopleList', data:[]});
			dd.setStorageSync({key:'summaryPeopleList', data:[]});
			dd.setStorageSync({key:'addExternalUserInfoList', data:[]});
			dd.setStorageSync({key:'addMeetingAttachmentList', data:[]});
			dd.setStorageSync({key:'addMeetingProcessList', data:[]});
            dd.redirectTo({
				url: '../confirmOrder/confirmOrder?webType=2&date=' + that.data.date + '&begin=' + that.data.begintime + '&end=' + that.data.endtime,
            })
        }
    },
    haveSomeMinutesTime: function(type, n) {
        if (n == null) {
            n = 0;
        }
        // 时间
        var newDate = new Date()
        // var timeStamp = newDate.getTime(); //获取时间戳
        var date = newDate.setMinutes(newDate.getMinutes() + n);
        newDate = new Date(date);
        var year = newDate.getFullYear();
        var month = newDate.getMonth() + 1;
        var day = newDate.getDate();
        var h = newDate.getHours();
        var m = newDate.getMinutes();
        var s = newDate.getSeconds();
        if (month < 10) {
            month = '0' + month;
        };
        if (day < 10) {
            day = '0' + day;
        };
        if (h < 10) {
            h = '0' + h;
        };
        if (m < 10) {
            m = '0' + m;
        };
        if (s < 10) {
            s = '0' + s;
        };
        if (type == 1) {
            var time = year + '-' + month + '-' + day;
        } else {
            var time = year + '-' + month + '-' + day + '-' + h + '-' + m + '-' + s;
        }
        return time;
    }
})