var express = require('express');
var router = express.Router();
var request = require("request");
var WxUser = require("../../models/WxUser");
var sequelize = require('sequelize');
var jsonwebtoken = require('jsonwebtoken');
var passport = require('passport');


router.post('/wx/token', function (req, res, next) {
    let appid='wx18cc75dbf1ca30aa';
    let secret='bce9584cf3b1c35a1833fd158e9e2e0d';
    let grant_type='authorization_code';
    let js_code = req.body.code;
    let param = '?appid='+appid+"&secret="+secret+"&js_code"+js_code+"&grant_type="+grant_type;

    request({
        url:'GET https://api.weixin.qq.com/sns/jscode2session'+param,
        method:'GET',
        headers:{'Content-Type':'text/json' }
    }, function(error, response, body){
        if(!error && response.statusCode===200){
            body = JSON.parse(body);
            let wechat_openid = body.openid;
			console.log("openid: "+wechat_openid);

            WxUser.findOne({where: {openid: wechat_openid}})
                .then(function (result) {
                    if(result==null){// 用户不存在
                        let user = {
                            openid: wechat_openid,
                            score: 0,
                        };
                        WxUser.create(user)
                            .then(function (result) {
                                //生成token
                                let userid = result.id;
                                let token = passport.endcode({
                                    userid: userid,
                                    openid: wechat_openid,
                                });
                                res.json({ token:token });
                            });
                    }
                    else{// 用户存在
                        // 生成token
                        let userid = result.id;
                        let token = passport.endcode({
                            userid: userid,
                            openid: wechat_openid,
                        });
                        res.json({ token:token });
                    }
                })
                .catch(function (err) {
                    console.log("error");
                });
        }
    });
});


router.post('/wx/reg', function (req, res, next){
    res.json({msg: 'this is /wx/reg'});
});


router.post('/wx/bet', function (req, res, next){
    let token = req.headers['token'];

    jsonwebtoken.verify(token, "this is a secret", function (err, decoded) {
        if (!err){
            console.log("error: jsonwebtoken.verify");
            res.json({status :0}); //token无效
        }
        else{
            console.log(decoded);
        }
    })
});


module.exports = router;

