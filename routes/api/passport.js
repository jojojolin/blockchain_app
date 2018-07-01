const jsonwebtoken = require('jsonwebtoken');


// function endcode(payload){
//     console.log("Entered endcode.");
//     let result = jsonwebtoken.sign(payload,"this is a secret",
//         {expiresIn: (60 * 60) + Math.floor(Date.now() / 1000)});  // 设置 token 过期时间
//     console.log("result is "+result);
//     return result;
// }

function endcode(payload){
    return jsonwebtoken.sign({
        data: payload,
        exp: (60 * 60) + Math.floor(Date.now() / 1000),  // 设置 token 过期时间
    }, "this is a secret");
}


function decode(token){
    return jsonwebtoken.decode(token.split(' ')[1], "this is a secret")
}


function verify(token){
    return jsonwebtoken.verify(token.split(' ')[1], "this is a secret")
}


function verifyid(token, idname, id){
    let payload=this.verify(token);
    if(payload.data[idname]==id){
        return true;
    }
    else{
        return false;
    }
}


module.exports = {
    endcode,
    decode,
    verify,
    verifyid
}; 

