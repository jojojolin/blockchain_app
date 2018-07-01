const Sequelize = require('sequelize');
const sequelize = require('./config');


const WxUser = sequelize.define(
    'WxUser',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        openid: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        score: {
            type: Sequelize.INTEGER,
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
WxUser.sync({force: false})
    .then(function() {
        console.log("WxUser sync successfully");
    })
    .catch(function(err){
        console.log("WxUser sync fail: "+err);
    });


module.exports = WxUser;

