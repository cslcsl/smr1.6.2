//logs.js
const app = getApp()
const utils = require('../../../utils/util.js')
Page({
    data: {
        name: '',
        loginState: false,
        loginInfo: '',
        list: '',
        upload_picture_list: '',
        uploadData: '',
        userIconId: ""
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
        if (app.globalData.loginInfo != null && app.globalData.loginInfo != '') {
            this.setData({
                loginState: true,
                loginInfo: app.globalData.loginInfo,
                name: app.globalData.loginInfo.userName,
                userIconId: app.globalData.loginInfo.userName
            })
        } else {
            this.setData({
                loginState: false
            })
        }
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
    nameInput: function(e) {
        this.setData({
            name: e.detail.value
        })
    },
    uploadimage: function() {
        var that = this;
        dd.chooseImage({ //选择图片
            count: 1,
            sizeType: ['original', 'compressed'],
            success(res) {
                const tempFiles = res.tempFilePaths
                console.log(tempFiles[0])
                //把选择的图片 添加到集合里
                var upload_picture_list = [];
                for (var i in tempFiles) {
                    upload_picture_list.push(tempFiles[i])
                }
                //显示
                that.setData({
                    upload_picture_list: tempFiles[0],
                });
                dd.uploadFile({ //上传文件
                    url: utils.setURL('/upload/image'), // 仅为示例，非真实的接口地址
                    filePath: tempFiles[0],
                    name: 'file',
                    header: {
                        "Content-Type": "multipart/form-data;charset=UTF-8",
                        "platform": 'APPLET',
                    },
                    success(res) {
                        var json = JSON.parse(res.data);
                        if (json.status == '0000') {
                            that.setData({
                                uploadData: json.res_data
                            })
                            that.confirm();
                        } else {
                            utils.showToast(json.message, 1000);
                        }
                    }
                })
            }
        })
    },
    confirm: function() {
        var that = this;
        if (that.data.name != '') {
            var sendData = {
                userIconId: that.data.uploadData.picId,
                userName: that.data.name
            }
            var callBack = {
                success: function(e) {
                    if (e.data.status == '0000') {
                        if (that.data.uploadData != '') {
                            app.globalData.loginInfo.userIcon = that.data.uploadData.url;
                        }
                        app.globalData.loginInfo.userName = that.data.name;
                        dd.setStorageSync({ key: 'loginInfo', data: app.globalData.loginInfo })
                        utils.showToast('修改成功', 1000);
                        setTimeout(function() {
                            //请求成功
                            dd.navigateBack({
                                delta: 1
                            })
                        }, 1000) //延迟时间
                    } else {
                        utils.showToast(e.data.message, 1000);
                    }
                },
                fail: function(e) {
                    utils.showToast(e.data.message, 1000);
                }
            }
            var url = '/user/person/' + app.globalData.loginInfo.userId;
            utils.ajax(utils.setURL(url), sendData, callBack, 'PUT');
        } else {
            utils.showToast('姓名不能为空', 1000);
        }
    },
    clearClick: function() {
        this.setData({
            name: ''
        })
    }
})