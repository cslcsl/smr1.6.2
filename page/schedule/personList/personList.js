const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        type: '',
        list: [],
		bookId:'',
		scheduleStatus:1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (options.type == 1) { //新增的参会人员
            this.setData({
                type: options.type,
                list: dd.getStorageSync({key:'selectPeopleList'}).data
            })
        } else if (options.type == 2) { //新增主持人
            this.setData({
                type: options.type,
                list: dd.getStorageSync({key:'hostPeopleList'}).data
            })

        } else if (options.type == 3) { //新增纪要人
            this.setData({
                type: options.type,
                list: dd.getStorageSync({key:'summaryPeopleList'}).data
            })
        } else if (options.type == 4) { //同意参加的人
            this.setData({
                type: options.type,
				list: dd.getStorageSync({key:'meetingPersonList'}).data
            })
        } else if (options.type == 5) { //拒绝参加的人
            this.setData({
                type: options.type,
				list: dd.getStorageSync({key:'meetingPersonList'}).data
            })
        } else if (options.type == 6) { //等待参加的人(会议详情)
            this.setData({
                type: options.type,
				list: dd.getStorageSync({key:'meetingPersonList'}).data
            })
			if (options.bookId != "" && options.bookId != undefined) {
				this.setData({
					bookId: options.bookId,
					scheduleStatus: options.scheduleStatus
				})
			}
        }
		console.log(this.data.list)
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
    personList: function() {
        console('切换菜单了');
        return;
        var that = this;
        var sendData = {
            discountList: '6234,6235',
            propertyid: app.globalData.loginInfo.userinfo.propertyid,
            orderNo: order,
            payType: 10,
            type: 1
        }
        var callBack = {
            success: function(e) {
                that.setData({
                    page: 0
                })
                //that.orderRequest();
            },
            fail: function(e) {
                utils.showToast({
                    title: e.errMsg,
                    icon: 'none',
                    duration: 1000
                });
            }
        }
        utils.ajax(utils.setURL('/pay/payment'), sendData, callBack);
    },
	editClick:function(){
		dd.setStorageSync('selectPeopleList', this.data.list)
		dd.navigateTo({
			url: '../../advance/joinList/joinList?type=1&&bookId='+this.data.bookId,
		})
	}
})