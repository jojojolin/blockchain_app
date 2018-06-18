// const Sequelize = require('sequelize-oracle');
const Sequelize = require('sequelize');
const sequelize = require('./config');


const WxBet = sequelize.define(
    'WxBet',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        openid: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        match_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        team_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        amount: {
            type: Sequelize.FLOAT,
            allowNull: false
        }
    },
    {
        // timestamps: true, //添加时间戳属性(updatedAt, createdAt)
        freezeTableName: true //自动使用传入的模型名（define的第一个参数）做为表名
    }
);


// 同步模型到数据库
// 通过设置force属性会首先删除表并重新创建
WxBet.sync({force: false})
    .then(function() {
        console.log("WxBet sync successfully");
    })
    .catch(function(err){
        console.log("WxBet sync fail: "+err);
    });


module.exports = WxBet;
