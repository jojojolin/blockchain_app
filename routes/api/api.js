var express = require('express');
var router = express.Router();
var request = require("request");


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
            console.log("response: "+response);
            console.log("body: "+body);
            res.json({data: body});
        }
    });
});


module.exports = router;

