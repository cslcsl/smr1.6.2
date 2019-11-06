const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        webType: 1,
        loginState: false,
        loginInfo: null,
        fileList: [],
        delBtnWidth: 120,
        isScroll: true,
        agendaState: false,
        pickerIndex: '',
        name: '',
        phone: '',
        email: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            webType: options.type
        })
        if (options.type == 1) { //会议室新增外部人员
            if (dd.getStorageSync({key:'addExternalUserInfoList'}).data != '' && dd.getStorageSync({key:'addExternalUserInfoList'}).data != undefined) {
                this.setData({
                    fileList: dd.getStorageSync({key:'addExternalUserInfoList'}).data
                })
            }

        } else if (options.type == 2) { //会议室详情外部人员
            if (dd.getStorageSync({key:'detailExternalUserInfoList'}).data != '' && dd.getStorageSync({key:'detailExternalUserInfoList'}).data != undefined) {
                this.setData({
                    fileList: dd.getStorageSync({key:'detailExternalUserInfoList'}).data
                })
            }
        }
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
    payOrder: function(order) {
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
                utils.showToast(e.errMsg,1000);
            }
        }
        utils.ajax(utils.setURL('/pay/payment'), sendData, callBack);
    },
    drawStart: function(e) {
        var touch = e.touches[0]
        for (var index in this.data.fileList) {
            var item = this.data.fileList[index]
            item.right = 0;
            item.deleteRight = -this.data.delBtnWidth - 30;
        }
        this.setData({
            fileList: this.data.fileList,
            startX: touch.clientX,
        })

    },
    drawMove: function(e) {
        var touch = e.touches[0]
        var item = this.data.fileList[e.currentTarget.dataset.index]
        var disX = this.data.startX - touch.clientX

        if (disX >= 20) {
            if (disX > this.data.delBtnWidth) {
                disX = this.data.delBtnWidth
            }
            item.right = disX;
            item.deleteRight = (-this.data.delBtnWidth);
            this.setData({
                isScroll: false,
                fileList: this.data.fileList
            })
        } else {
            item.right = 0
            this.setData({
                isScroll: true,
                fileList: this.data.fileList
            })
        }
    },
    drawEnd: function(e) {
        var item = this.data.fileList[e.currentTarget.dataset.index]
        if (item.right >= this.data.delBtnWidth / 2) {
            item.right = this.data.delBtnWidth
            this.setData({
                isScroll: true,
                fileList: this.data.fileList,
            })
        } else {
            item.right = 0;
            item.deleteRight = -this.data.delBtnWidth - 30;
            this.setData({
                isScroll: true,
                fileList: this.data.fileList,
            })
        }
    },
    delItem: function(e) {
        var fileList = this.data.fileList;
        var index = e.currentTarget.dataset.index;
        var list = [];
        for (var i = 0; i < fileList.length; i++) {
            if (index != i) {
                list.push(fileList[i]);
            }
        }
        this.setData({
            fileList: list
        })
        dd.setStorageSync({key:'addExternalUserInfoList', data:this.data.fileList});
    },
    nameInput: function(e) {
        this.setData({
            name: e.detail.value
        })
    },
    phoneInput: function(e) {
        this.setData({
            phone: e.detail.value
        })
    },
    emailInput: function(e) {
        this.setData({
            email: e.detail.value
        })
    },
    agendaAdd: function() {
        this.setData({
            agendaState: true
        })
    },
    agendaCancel: function(e) {
        this.setData({
            agendaState: false,
            name: '',
            phone: '',
            email: ''
        })
    },
    agendaComplete: function() {
        if (this.data.name == '') {
            utils.showToast("名字不能为空", 1000);
            return;
        }
        if (this.data.phone != '') {
            if (!(this.data.phone && /^1[3456789]\d{9}$/.test(this.data.phone))) {
                utils.showToast("请输入正确格式的手机号", 1000)
                return;
            }
        }
        var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
        // if (this.data.email == '') {
        //     utils.showToast("邮箱地址不能为空", 1000)
        //     return;
        // } else 
		if (!reg.test(this.data.email) && this.data.email!='') { //正则验证不通过，格式不对
            　　　　
            utils.showToast("请输入正确格式的邮箱地址", 1000)　　　　
            return;　　
        }
        var fileList = this.data.fileList;
        var list = {
            userName: this.data.name,
            userPhone: this.data.phone,
            userMailbox: this.data.email
        }
        fileList.push(list);

        this.setData({
            fileList: fileList,
            agendaState: false,
            name: '',
            phone: '',
            email: ''
        })
        if (this.data.webType == 1) {
            dd.setStorageSync({key:'addExternalUserInfoList', data:this.data.fileList});
        } else {
            dd.setStorageSync({key:'detailExternalUserInfoList', data:this.data.fileList});
        }
	}, nameInputClear:function(){
		this.setData({
			name:''
		})
	}
})