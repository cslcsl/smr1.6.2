App({
    onLaunch(options) {
        // console.log('App Launch', options);
        // console.log('getSystemInfoSync', dd.getSystemInfoSync());
        // console.log('SDKVersion', dd.SDKVersion);
        this.globalData.corpId = options.query.corpId;
    },
    onShow() {
        // console.log('App Show');
    },
    onHide() {
        // console.log('App Hide');
    },
    globalData: {
        corpId: '',
        userInfo: null, //当前微信用户信息
        userInfoState: false,
        loginInfo: '', //登录人用户信息
        propertyid: 1,
        searchTitleList: [],
        todoNumber: 0,
        meetingType: 1,
        environment: '',
        // faceType: 'SMR' //正式环境
        // faceType: 'SMR_BETA' //beta环境
        faceType: 'SMR_TEST' //正式环境
        // faceType: 'SMR_DEV',
        // faceType: ''
    }
});