   var express = require('express');
var router = express.Router();
var request = require("request");
var WxUser = require("../../models/WxUser");
var WxBet = require("../../models/WxBet");
var Match = require("../../models/Match");
var sequelize = require('sequelize');
var jsonwebtoken = require('jsonwebtoken');
var passport = require('passport');
var moment = require('moment');

/***
 *  请求赌注历史
 */
router.post('/getAllBets',function(req, res,next){
    res.set('Access-Control-Allow-Origin', '*');
    let token = req.body.token;
    jsonwebtoken.verify(token,"this is a secret", function(err, decoded){
        if(err){
            console.log("Error: "+err, " TOKEN: "+token);
            res.json({
                msg:"Token 报错："+err,
                statusCode:-1
            });
        }
        else{
            let openid = decoded.data.openid;
            (async () => {
                var bets = await WxBet.findAll({where:{openid:openid}});
                var matches= [];
                var result = [];
                for(let b of bets){
                    matches.push(await Match.findOne({where:{id:b.match_id}}));
                }
                console.log("matches: "+matches);
                for(let i = 0; i < bets.length; i++){
                    var select ="";
                    if(bets[i].team_id == 1){
                        select = matches[i].team1_name;
                    }
                    else if(bets[i].team_id == 2){
                        select = "平";
                    }
                    else if(bets[i].team_id == 3){
                        select = matches[i].team2_name;
                    }
                    result.push({
                        date:matches[i].date,
                        select:select,
                        amount:bets[i].amount
                    });
                }
                console.log("result: "+result);
                res.json({
                        bet_history:result,
                        statusCode: 1,
                        msg:"成功調回下注紀錄！"
                });
            })();
        }
    });
});


/**
 * 客户端换取token
 */
router.post('/wx/token', function (req, res, next) {
    let appid='wx18cc75dbf1ca30aa';
    let secret='d84eb0c892ada7350d6780c411f16be4';
    let grant_type='authorization_code';
    let js_code = req.body.code;
    let param = '?appid='+appid+"&secret="+secret+"&js_code="+js_code+"&grant_type="+grant_type;
	console.log("/wx/token");
	
	
    request({
        url:'https://api.weixin.qq.com/sns/jscode2session'+param,
        method:'GET',
        headers:{ 'Content-Type':'text/json'}
    }, function(error, response, body){

    let obj = JSON.parse(body);
	console.log(body);
        if(error || response.statusCode!=200){
            return res.json({msg: '请求网络接口失败！'});
        }
	let wechat_openid = obj.openid;
        if(wechat_openid==null){
            return res.json({msg: '请求openid失败！'});
        }
	console.log("openid is "+wechat_openid);
        WxUser.findOne({where: {openid: wechat_openid}})
            .then(function (result) {
                if(result==null){// 用户不存在
                    console.log("User doesn't exist.");
		    let user = {
                        openid: wechat_openid,
                        score: 0,
                    };
                    WxUser.create(user)
                        .then(function (result) {
                            //生成token
			    console.log("start generating token...");
                            let userid = result.id;
                            let token = jsonwebtoken.sign({
                                data:{
                                        userid: userid,
                                        openid: wechat_openid,
                                    },
                                exp: (60 * 60 * 24 * 2) + Math.floor(Date.now() / 1000),  // 设置 token 过期时间
                            }, "this is a secret");
                            res.json({
                                token: token,
                                score: result.score,
                                msg: '请求网络接口成功！'
                            });
                        });
                }
                else{// 用户存在
                    // 生成token
		    console.log("User exists!");
                    let userid = result.id;
		    console.log("userid: "+userid);
		    console.log("score: "+result.score);
            let token = jsonwebtoken.sign({
                data:{
                        userid: userid,
                        openid: wechat_openid,
                    },
                exp: (60 * 60) + Math.floor(Date.now() / 1000),  // 设置 token 过期时间
            }, "this is a secret");
		    console.log("token: "+token);
                    res.json({
                        token:token,
                        
                        score: result.score,
			msg:'请求成功！'
                    });
                }
            })
            .catch(function (err) {
                res.json({status: '访问数据库失败！'});
            });
        //}
    });
});


/**
 * 更新数据库用户信息
 */
router.post('/wx/reg', function (req, res, next){
    res.json({msg: 'this is /wx/reg'});
});


/**
 * 用户投注
 */
router.post('/wx/bet', function (req, res, next){
 
    let token = req.body.token;
    console.log("debug: token:"+token);
    
    jsonwebtoken.verify(token, "this is a secret", function (err, decoded) {
        if (err){
            console.log("error: "+err);//jsonwebtoken.verify
            res.json({status :err}); //token无效
        }
        else{
            console.log("decoded: "+JSON.stringify(decoded));
            console.log("open id from decoded： "+decoded.data.openid);

            let bet = {
                openid:decoded.data.openid,
                match_id:parseInt(req.body.match_id),
                team_id:parseInt(req.body.team_id),
                amount:parseFloat(req.body.amount)
            };
            console.log("bet object: "+JSON.stringify(bet));
           WxBet.create(bet)
               .catch(function (err) {
                   res.json({status: '数据库INSERT失败！'});
               });
        }
    })
});


/***
 *  请求所有比赛
 */
router.get('/getAllMatches',function(req, res){
    res.set('Access-Control-Allow-Origin', '*');
    console.log("Debug 1");
    Match.findAll()
            .then(function (result) {
                if(result==null){// 没有比赛
                    console.log("No games available now.");
                    res.json({statusCode:0});
                }
                else{// 比赛存在
                    res.json({
                        matchData:result,
                        statusCode:1
                    });
                }
            })
            .catch(function (err) {
                res.json({
                    msg: '访问数据库失败！',
                    statusCode:-1
                });
            });
});

/***
 *  请求赌注历史
 */
router.post('old/getAllBets',function(req, res,next){
    res.set('Access-Control-Allow-Origin', '*');
    let token = req.body.token;
    jsonwebtoken.verify(token,"this is a secret", function(err, decoded){
        if(err){
            console.log("Error: "+err, " TOKEN: "+token);
            res.json({
                msg:"Token 报错："+err, 
                statusCode:-1
            });
        }
        else{
            let openid = decoded.data.openid;
            WxBet.findAll({where:{openid:openid}})
                .then(function(result){
                    if(result==null){
                        console.log("No bet history.");
                        res.json({
                            msg:"目前没有历史纪录",
                            statusCode:0
                        });
                    }
                    else{
                        for(let i = 0; i<result.length;i++){
                            let bet = result[i];
                            let team_id = bet.team_id;
                            Match.findOne({where:{id:bet.match_id}})
                                .then(function(match){
                                    if(match == null){
                                        console.log("No match is found:( \ncheck match_id is correct");
                                    }
                                    else{
                                        let select = ""
                                        if(team_id == 1){
                                            select = match.team1_name;
                                        }
                                        else if(team_id ==2){
                                            select = "平"; 
                                        }
                                        else if(team_id == 3){
                                            select = match.team2_name;
                                        }
                                        result[i]={
                                            "date":match.date,
                                            "select":select,
                                            "amount":bet.amount
                                        };
                                    }
                                });
                        }
                        res.json({
                            bet_history:result,
                            msg:"成功获取历史纪录",
                            statusCode:1
                        });
                    }
                }).catch(function (err) {
                    res.json({
                        msg: '访问数据库失败！',
                        statusCode:-1
                    });
                });
        }
    });
});

/**
 * 更新分数
 */
router.post('/wx/updateScore', function(req, res, next){
    let token = req.body.token;
    let scoreToAdd = req.body.add;
    jsonwebtoken.verify(token,"this is a secret", function(err, decoded){
        if(err){
            console.log("Error: "+err);
            res.json({
                msg:"Token 报错："+err, 
                statusCode:-1
            });
        }
        else{
            let openid = decoded.data.openid;
            WxUser.update({score:score+scoreToAdd},{where:{openid:openid}})
                .catch(function (err) {
                    console.log('访问数据库失败！');
                    res.json({
                        msg: '访问数据库失败！',
                        statusCode:-1
                    });
                });
        }
    });
});


/**
 * 请求分数
 */
router.get('/wx/getScore', function(req, res){
    jsonwebtoken.verify(req.body.token,"this is a secret", function(err,decoded){
        if(err){
            console.log("Token报错 "+err);
            res.json({msg:"Token报错 "+err, statusCode:-1});
        }
        else{
            let openid = decoded.data.openid;
            WxUser.findOne({where:{openid:openid}})
                .then(function(result){
                    if(result == null){
                        console.log("用户不存在于数据库！");
                        res.json({statusCode:0});
                    }
                    else{
                        res.json({score:result.score, statusCode:1,});
                    }
                }).catch(function (err) {
                    console.log('访问数据库失败！');
                    res.json({
                        msg: '访问数据库失败！',
                        statusCode:-1
                    });
                });
        }
    });
});

/**
 * 请求用户资讯（分数 & 概率）
 */
router.get('/wx/getUserInfo',function(req,res){
    jsonwebtoken.verify(req.body.token,"this is a secret", function(err,decoded){
        if(err){
            console.log("Token报错 "+err);
            res.json({msg:"Token报错 "+err, statusCode:-1});
        }
        else{
            let openid = decoded.data.openid;
            WxUser.findOne({where:{openid:openid}})
                .then(function(result){
                    if(result == null){
                        console.log("用户不存在于数据库！");
                        res.json({statusCode:0});
                    }
                    else{
                        if(result.played == 0){
                            res.json({
                                winProb:100,
                                score:result.score,
                                statusCode:1
                            });
                        }
                        else{
                            res.json({
                                winProb:(result.won/result.played).toFixed(2)*100,
                                score:result.score,
                                statusCode:1
                            });
                        }
                    }
                }).catch(function (err) {
                    console.log('访问数据库失败！');
                    res.json({
                        msg: '访问数据库失败！',
                        statusCode:-1
                    });
                });
        }
    });
});


 /**
  * 更新综合概率
  */
router.post('/wx/updateWinProb',function(req,res){
    let result = req.body.result;
    jsonwebtoken.verify(req.body.token,"this is a secret", function(err,decoded){
        if(err){
            console.log("Token报错： "+err);
            res.json({msg:"Token报错： "+err, statusCode:-1});
        }
        else{
            let openid = decoded.data.openid;
            if(result == 0){
                WxUser.update({played:played+1},{where:{openid:openid}})
                .catch(function (err) {
                    console.log('访问数据库失败！');
                    res.json({
                        msg: '访问数据库失败！',
                        statusCode:-1
                    });
                });
            }
            else if(result == 1){
                WxUser.update({played:played+1, won:won+1},{where:{openid:openid}})
                .catch(function (err) {
                    console.log('访问数据库失败！');
                    res.json({
                        msg: '访问数据库失败！',
                        statusCode:-1
                    });
                });
            }
        }
    });
});

/**
 * 请求全球排行
 */
router.get('/getRanking',function(req, res){
    WxUser.findAll({limit : 10, order : 'score desc'}).then(function(result){
        res.json({
            ranking:result
        });
    }).catch(function(err){
            console.log('访问数据库失败！');
            res.json({
                msg:'访问数据库失败！',
                statusCode:-1
            });
        });
});


module.exports = router;
