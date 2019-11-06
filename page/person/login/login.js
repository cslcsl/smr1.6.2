//logs.js
const app = getApp()
import utils from '../../../utils/util.js';
Page({
    data: {
        mobile: '',
        password: '',
        userInfo: {},
        hasUserInfo: false,
        canIUse: dd.canIUse('button.open-type.getUserInfo'),
        openid: '',
        maskWrap: false,
        rescode: '',
        environment: '',
        accessToken: '',
        userId: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        }
        this.accessToken()
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
        this.loginCode();
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
    getUserInfo: function(e) {
        var that = this;
        console.log(e.detail.userInfo)
        if (e.detail.userInfo != undefined) {
            app.globalData.userInfo = e.detail.userInfo
            that.setData({
                userInfo: e.detail.userInfo,
                hasUserInfo: true
            })
            dd.navigateTo({
                url: '../loginPassword/loginPassword',
            })
        } else {
            utils.showToast('拒绝授权，无法创建账户', 1000);
            return;
            dd.openSetting({
                success: function(data) {
                    if (data) {
                        if (data.authSetting["scope.userInfo"] == true) {
                            loginStatus = true;
                            dd.getUserInfo({
                                withCredentials: false,
                                success: function(data) {
                                    app.globalData.userInfo = data.userInfo;
                                    that.setData({
                                        userInfo: e.detail.userInfo,
                                        hasUserInfo: true
                                    })
                                },
                                fail: function() {
                                    console.info("2授权失败返回数据");
                                }
                            });
                        }
                    }
                },
                fail: function() {
                    console.info("设置失败返回数据");
                }
            });
        }
    },
    userInfo: function() {
        var that = this;
        var sendData = {
            avatarUrl: app.globalData.userInfo.avatarUrl,
            city: app.globalData.userInfo.city,
            country: app.globalData.userInfo.country,
            gender: app.globalData.userInfo.gender,
            language: app.globalData.userInfo.language,
            nickName: app.globalData.userInfo.nickName,
            province: app.globalData.userInfo.province,
            phone: that.data.mobile,
            openId: that.data.openid
        }
        var callBack = {
            success: function(e) {
                if (e.data.code == 0) {
                    app.globalData.userInfoState = true;
                }
            },
            fail: function(e) { }
        }
        utils.ajax(utils.setURL('/user/saveWxUserInfo'), sendData, callBack);
    },
    getPhoneNumber: function(e) {
        var that = this;
        // if (e.detail.errMsg == 'getPhoneNumber:ok') {
        //     var sendData = {
        //         code: that.data.rescode,
        //         iv: e.detail.iv,
        //         encryptedData: e.detail.encryptedData
        //     }
        //     var callBack = {
        //         success: function(e) {
        //             if (e.data.status == '0000') {
        //                 dd.setStorageSync('loginInfo', e.data.res_data);
        //                 app.globalData.loginInfo = e.data.res_data;
        //             } else {
        //                 utils.showToast({
        //                     title: '登录失败,请重新登录',
        //                     icon: 'none',
        //                     duration: 1000
        //                 });
        //                 return;
        //             }
        //             if (e.data.res_data.userId == null) {
        //                 that.setData({
        //                     maskWrap: true
        //                 })
        //                 return;
        //             }
        //             if (e.data.res_data.userStatus == 1) {
        //                 var pages = getCurrentPages();
        //                 if (pages.length > 1) {
        //                     let pages = getCurrentPages();
        //                     let prevPage = pages[pages.length - 2];
        //                     dd.swStorageSyncitchTab({
        //                         url: '../../schedule/index',
        //                     })
        //                 } else {
        //                     dd.switchTab({
        //                         url: '../../schedule/index',
        //                     })
        //                 }
        //             } else if (e.data.res_data.userStatus == null || e.data.res_data.userStatus == "" || e.data.res_data.userStatus == 0) { //新加入
        //                 dd.navigateTo({
        //                     url: '../companyId/companyId',
        //                 })

        //             } else if (e.data.res_data.userStatus == 2) { //待审核
        //                 dd.redirectTo({
        //                     url: '../loginResult/loginResult',
        //                 })
        //             } else {
        //                 utils.showToast(e.data.res_message, 1000)
        //             }
        //             that.loginCode();
        //         },
        //         fail: function(e) {
        //             utils.showToast(e.errMsg, 1000)
        //             that.loginCode();
        //         }
        //     }
        //     utils.ajax(utils.setURL('/user/wxLogin'), sendData, callBack);
        // } else {
        //     utils.showToast("拒绝授权,无法登录", 1000)
        //     that.loginCode();
        // }
    },
    maskClose: function() {
        this.setData({
            maskWrap: false
        })
        this.loginCode();
    },
    loginCode: function() {
        var that = this;
        if (app.globalData.environment == 'wxwork') {
            dd.qy.login({
                success: function(rescode) {
                    if (rescode.code) {
                        that.setData({
                            rescode: rescode.code
                        })
                        console.log(rescode.code)
                        var sendData = {
                        }
                        var callBack = {
                            success: function(e) {
                                if (e.data.code == 0) {
                                    app.globalData.userInfoState = true;
                                }
                                that.getPhoneNumber()
                            },
                            fail: function(e) { }
                        }
                        utils.ajax(utils.setURL('/user/qyLogin/' + rescode.code), sendData, callBack, "GET");
                    } else {
                        utils.showToast('获取授权code失败', 1000)
                        console.log('登录失败！' + res.errMsg)
                    }
                }
            });
        } else {
            // dd.login({
            // 	success(rescode) {
            // 		that.setData({
            // 			rescode: rescode.code
            // 		})
            // 	},
            // 	fail(res) {
            // 		utils.showToast('获取授权code失败', 1000)
            // 	}
            // })
        }
    },
    accessToken: function() {
        var that = this
        dd.httpRequest({
            url: 'https://oapi.dingtalk.com/gettoken?appkey=dingvu5ibdj57bfk6jjd&appsecret=kOFdQiX9I4072MyclP__97tU3xwYExXUaJS4f-7zataGXdtJ-6KOKAvX_45cxaT3',
            method: 'GET',
            success: function(res) {
                that.setData({
                    accessToken: res.data.access_token
                })
                that.userId(res.data.access_token)
            },
            fail: function(res) {
                dd.alert({ content: 'fail' });
            }
        });
    },
    userId: function(token) {
        var that = this
        dd.getAuthCode({
            success: function(res) {
                dd.httpRequest({
                    url: 'https://oapi.dingtalk.com/user/getuserinfo?access_token=' + token + '&code=' + res.authCode,
                    method: 'GET',
                    success: function(res) {
                        that.userInfo(token, res.data.userid)
                    },
                    fail: function(res) {
                        dd.alert({ content: 'fail' });
                    }
                });
            },
            fail: function(err) {
            }
        });
    },
    userInfo: function(token, userid) {
        var that = this
        dd.httpRequest({
            url: 'https://oapi.dingtalk.com/user/get?access_token=' + token + '&userid=' + userid,
            method: 'GET',
            success: function(res) {
                console.log(res)
            },
            fail: function(res) {
                dd.alert({ content: 'fail' });
            }
        });

    },
})