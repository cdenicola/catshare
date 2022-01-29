// sentTokenCookie creates a cookie which expires after one day
const sendUserIdCookie = (userId, res) => {
    // Our token expires after one day
    const oneDayToSeconds = 24 * 60 * 60;
    res.cookie('userId', btoa(userId),  
    { maxAge: oneDayToSeconds,
    // // You can't access these tokens in the client's javascript
    //   httpOnly: true,
    //   // Forces to use https in production
    //   secure: process.env.NODE_ENV === 'production'? true: false
    });
};

// returns an object with the cookies' name as keys
const getAppCookies = (req) => {
    // We extract the raw cookies from the request headers
    try {
        const rawCookies = req.headers.cookie.split('; ');
        // rawCookies = ['myapp=secretcookie, 'analytics_cookie=beacon;']

        const parsedCookies = {};
        rawCookies.forEach(rawCookie=>{
            const parsedCookie = rawCookie.split('=');
            // parsedCookie = ['myapp', 'secretcookie'], ['analytics_cookie', 'beacon']
            parsedCookies[parsedCookie[0]] = parsedCookie[1];
        });
        return parsedCookies;
    }
    catch {
        return undefined;
    }
};
   
// Returns the value of the userId cookie
const getUserId = (req, res) =>  {
    try {
        return atob(getAppCookies(req, res)['userId']);
    }
    catch {
        return undefined;
    }
}

// const clearUserId = (req, res) => res.clearCookie('userId');

module.exports = {
    sendUserIdCookie: sendUserIdCookie,
    getUserId: getUserId,
    // clearUserId: clearUserId
};