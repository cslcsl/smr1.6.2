// pages/person/passwordEdit/passwordEdit.js
const utils = require('../../../utils/util.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        oldPassword: '',
        newPassword: '',
        surePassword: '',
        canClick: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

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

    //确认修改密码
    editPassword: function() {
        if (this.data.oldPassword == '' || this.data.newPassword == '' || this.data.surePassword == '') {
            return;
        }
        var that = this;
        //确认密码与新密码一直才可以修改
        if (that.data.newPassword == that.data.surePassword) {
            if (this.data.newPassword.length < 6 || this.data.newPassword.length > 16) {
                utils.showToast('密码长度应为6-16位',1000);
                return;
            }
            //调接口
            var sendData = {
                oldPassWord: that.data.oldPassword,
                newPassWord: that.data.newPassword,
            }
            var callBack = {
                success: function(e) {
                    if (e.data.status == '0000') {
                        utils.showToast('密码修改成功',1000);
                        setTimeout(function() {
                            //请求成功
                            dd.navigateBack({
                                delta: 1
                            })
                        }, 1000) //延迟时间
                    } else {
                        utils.showToast(e.data.message,1000);
                    }
                },
                fail: function(e) {
                    utils.showToast(e.errMsg,1000);
                }
            }
            utils.ajax(utils.setURL('/user/changepwd'), sendData, callBack, 'POST');
        } else {
            utils.showToast('2次密码输入不同',1000)
        }
    },

    //输入老的密码
    inputOldPw: function(e) {
        this.setData({
            oldPassword: e.detail.value
        })
        if (this.data.oldPassword != "" && this.data.newPassword != '' && this.data.surePassword != '') {
            this.setData({
                canClick: true
            })
        } else {
            this.setData({
                canClick: false
            })
        }
    },

    //输入新的密码
    inputNewPw: function(e) {
        this.setData({
            newPassword: e.detail.value
        })
        if (this.data.oldPassword != "" && this.data.newPassword != '' && this.data.surePassword != '') {
            this.setData({
                canClick: true
            })
        } else {
            this.setData({
                canClick: false
            })
        }
    },
    //输入确认密码
    inputSurePw: function(e) {
        this.setData({
            surePassword: e.detail.value
        })
        if (this.data.oldPassword != "" && this.data.newPassword != '' && this.data.surePassword != '') {
            this.setData({
                canClick: true
            })
        } else {
            this.setData({
                canClick: false
            })
        }
    }
})