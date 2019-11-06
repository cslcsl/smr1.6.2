let app = getApp();
import utils from '../../utils/util.js';
let domain = "http://localhost:3000";
let url = domain + '/login';
Page({
  data: {
    corpId: '',
    authCode: '',
    userId: '',
    userName: '',
    hideList: true,
  },
  loginSystem1() {
    var that = this;
    var sendData = {}
    var callBack = {
      success: function(e) {
        if (e.data.status == '0000') {
          app.globalData.meetingType = e.data.res_data.timeDimension
          utils.showToast(e.data.message,2000)
        }
      },
      fail: function(e) { }
    }
    utils.ajax(utils.setURL('/smr/configuration/findMeetingConfiguration'), sendData, callBack, "GET");
  },
  loginSystem() {
    dd.showLoading();
    dd.getAuthCode({
      success: (res) => {
        this.setData({
          authCode: res.authCode
        })
        //dd.alert({content: "step1"});
        dd.httpRequest({
          url: url,
          method: 'POST',
          data: {
            authCode: res.authCode
          },
          dataType: 'json',
          success: (res) => {
            // dd.alert({content: "step2"});
            console.log('success----', res)
            let userId = res.data.result.userId;
            let userName = res.data.result.userName;
            this.setData({
              userId: userId,
              userName: userName,
              hideList: false
            })
          },
          fail: (res) => {
            console.log("httpRequestFail---", res)
            dd.alert({ content: JSON.stringify(res) });
          },
          complete: (res) => {
            dd.hideLoading();
          }

        });
      },
      fail: (err) => {
        // dd.alert({content: "step3"});
        dd.alert({
          content: JSON.stringify(err)
        })
      }
    })

  },
  onLoad(options) {
    let _this = this;
    this.setData({
      corpId: app.globalData.corpId
    })
    console.log(app.globalData.corpId)       
  }
})