// const Sequelize = require('sequelize-oracle');
// const Sequelize = require('cu8-sequelize-oracle');
const Sequelize = require('sequelize');


const sequelize = new Sequelize('app_blockchain4', 'jolin', 'J860809c', {
    host: 'localhost',
    port: 0000,
    dialect: 'mysql',
    pool: {
        min: 0,
        max: 5,
        idle: 10000,
        acquire: 30000,
    },
});


//测试数据库链接
sequelize.authenticate().then(function() {
    console.log("数据库连接成功");
}).catch(function(err) {
    //数据库连接失败时打印输出
    console.log("数据库连接失败");
    //console.error(err);
    //throw err;
});


module.exports = sequelize;

