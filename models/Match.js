// const Sequelize = require('sequelize-oracle');
// const Sequelize = require('cu8-sequelize-oracle');
const Sequelize = require('sequelize');
const sequelize = require('./config');
var moment = require('moment');


const Match = sequelize.define(
    'Match',
    {
        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true,},
        league_name: {type: Sequelize.STRING(100), allowNull: true},
        description: {type: Sequelize.STRING(100), allowNull: true},
        date: {type: Sequelize.STRING(100), allowNull: true},
        match_begin_time: {type: Sequelize.DATE, allowNull: true,
            get: function () {
                return moment(this.getDataValue('match_begin_time')).format("YYYY-MM-DD HH:mm:ss");
            },
        },
        bet_end_time: {type: Sequelize.DATE, allowNull: true,
            get: function () {
                return moment(this.getDataValue('bet_end_time')).format("YYYY-MM-DD HH:mm:ss");
            },
        },
        address: {type: Sequelize.STRING(100), allowNull: true},
        contract: {type: Sequelize.STRING(100), allowNull: true},

        team1_name: {type: Sequelize.STRING(100), allowNull: true},
        team1_logo: {type: Sequelize.STRING(100), allowNull: true},
        score1: {type: Sequelize.INTEGER, allowNull: true},
        team2_name: {type: Sequelize.STRING(100), allowNull: true},
        team2_logo: {type: Sequelize.STRING(100), allowNull: true},
        score2: {type: Sequelize.INTEGER, allowNull: true},

        odds1: {type: Sequelize.FLOAT, allowNull: true},
        odds2: {type: Sequelize.FLOAT, allowNull: true},
        odds3: {type: Sequelize.FLOAT, allowNull: true},

        types: {type: Sequelize.INTEGER, allowNull: true},
        groups: {type: Sequelize.STRING(1), allowNull: true},
    },
    {
        // timestamps: true, //添加时间戳属性(updatedAt, createdAt)
        freezeTableName: true //自动使用传入的模型名（define的第一个参数）做为表名
    }
);


// 同步模型到数据库
// 通过设置force属性会首先删除表并重新创建
Match.sync({force: false})
    .then(function() {
        console.log("Match sync successfully");
    })
    .catch(function(err){
        console.log("Match sync fail: "+err);
    });


module.exports = Match;

