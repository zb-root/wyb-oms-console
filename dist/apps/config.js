// config
// 下面四行不要修改，部署到容器时会被环境变量替换
var StaticHost;
var StaticPort;
var ApiHost;
var ApiPort;

var gConfig = {
    localhost: {
        apiHost: "http://localhost:20200",
        sdkHost: "http://localhost:20200",
        opensdkHost: "http://localhost:20300",
        staticHost:"http://localhost:20400"
    },
    development: {
        apiHost: "http://api.wyb.jamma.cn",
        sdkHost: "http://api.wyb.jamma.cn",
        opensdkHost: "http://api.wyb.jamma.cn",
        staticHost:"http://api.wyb.jamma.cn"
    },
    production: {
        apiHost: "http://server.wawa.gzleidi.cn",
        sdkHost: "http://server.wawa.gzleidi.cn",
        opensdkHost: "http://server.wawa.gzleidi.cn",
        staticHost:"http://server.wawa.gzleidi.cn"
    }
};

gConfig = gConfig['development'];

var staticHost;
var apiHost;
var sdkHost;
var opensdkHost;
var robotUri;

StaticHost && (staticHost = 'http://' + StaticHost);
StaticPort && (staticHost += ':' + StaticPort);
ApiHost && (apiHost = 'http://' + ApiHost);
ApiPort && (apiHost += ':' + ApiPort);
ApiHost && (robotUri = ApiHost);
ApiPort && (robotUri += ':' + ApiPort);

staticHost || (staticHost = gConfig.staticHost);
apiHost || (apiHost = gConfig.apiHost);
sdkHost || (sdkHost = gConfig.sdkHost || apiHost);
opensdkHost || (opensdkHost = gConfig.opensdkHost || apiHost);
robotUri || (robotUri = gConfig.robotUri);

var ssoUri = apiHost+"/sso";
var passportUri = apiHost+"/passport";
var usersUri = apiHost+"/user/users";
var aclUri  = apiHost + "/acl";
var omsUri = apiHost + "/oms";
var configUri = apiHost + "/config";
var logUri = apiHost + '/log'
var companyUri = apiHost + '/company'

jm.sdk.init({uri: apiHost});

var domain = '';
var host = document.domain;
if(domain&&host.indexOf(domain)>=0){
    document.domain = domain;
}

var omsnav = "nav";

var com = 'mxx';
var plat