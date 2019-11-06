const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        selectList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
		if (dd.getStorageSync({key:'deviedList'}).data != ''&&dd.getStorageSync({key:'deviedList'}).data!=undefined&&dd.getStorageSync({key:'deviedList'}).data.length != 0) {
            this.setData({
                selectList: dd.getStorageSync({key:'deviedList'}).data
            })
        }
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
    listClick: function(e) {
        var selectList = this.data.selectList;
        var index = e.currentTarget.dataset.index;
        var list = this.data.list;
        var state = e.currentTarget.dataset.state;
        list[index].state = !state;
        var newList = [];
        if (state) { //取消选择
            for (var i = 0; i < selectList.length; i++) {
                if (selectList[i].mroomEquipmentId != list[index].mroomEquipmentId) {
                    newList.push(selectList[i]);
                }
            }
        } else {
            newList = selectList;
            newList.push(list[index]);
        }
        this.setData({
            list: list,
            selectList: newList
        })
        console.log(this.data.selectList)
    },
    confirm: function() {
        dd.setStorageSync('deviedList', this.data.selectList);
        dd.navigateBack({
            delta: 1
        })
		//console.log(this.data.selectList)
    },
    dataList: function() {
        var that = this;
        var selectList = that.data.selectList;
        var sendData = {}
        var callBack = {
            success: function(e) {
                //console.log(e.data.res_data);
                if (e.data.status == '0000') {
                    for (var i = 0; i < e.data.res_data.length; i++) {
                        e.data.res_data[i].state = false;
                        for (var j = 0; j < selectList.length; j++) {
                            if (e.data.res_data[i].mroomEquipmentId == selectList[j].mroomEquipmentId) {
                                e.data.res_data[i].state = true;
                            }
                        }

                    }
                    that.setData({
                        list: e.data.res_data
                    })
                    //console.log(that.data.list)
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg,1000);
            }
        }
		var url = '/mroomequipment/list/' + app.globalData.loginInfo.propertyId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    }
})