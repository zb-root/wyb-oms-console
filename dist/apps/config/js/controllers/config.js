
app.controller('ConfigCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'common', 'global', function($scope, $http, $state, $stateParams, $timeout, common, global) {
    var sso = jm.sdk.sso;

}]);

app.controller('ConfigCreateCtrl', ['$scope', '$http', '$state', '$stateParams', 'global', function($scope, $http, $state, $stateParams, global) {
    var sso = jm.sdk.sso;

}]);

app.controller('ConfigMenusCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var sso = jm.sdk.sso;
    $scope.val = '';

    var originData = {};
    $http.get(omsUri + '/nav', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            originData = result;
            console.log(originData)
            $scope.val = JSON.stringify(obj, null, "\t");
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.save = function(){
        if(!$scope.val){
            return $scope.warning('请输入数据');
        }
        var value;
        try{
            value = JSON.parse($scope.val);
        }catch (e){
            return $scope.warning('请输入正确的JSON格式数据');
        }

        var location = [global.translateByKey('app.config.manage'),global.translateByKey('app.config.menus')];
        var field = {
            val:'app.config.menus'
        }
        $http.post(configUri+'/navconfig', {data:value}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                global.sendLog(26, {val:originData}, {val:value}, field, 1, "app.config.menus", location, 1,function (err, result) {
                    console.log("err %j, result %j", err, result);
                });
                // angular.copy(value,menus);
                originData = value;

                $scope.success('配置成功');
                $scope.val = JSON.stringify(value, null, "\t");
            }
        }).error(function(msg, code){
            global.sendLog(26, {val:originData}, {val:value}, field, 0, "app.config.menus", location, 1,function (err, result) {
                console.log("err %j, result %j", err, result);
            });
            $scope.errorTips(code);
        });
    };
}]);


app.controller('ConfigSystemInitCtrl', ['$scope', '$http', '$state', '$stateParams', 'global', function($scope, $http, $state, $stateParams, global) {
    var sso = jm.sdk.sso;
    var getItems = function(){
        $http.get(configUri+'/systeminit', {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.systems = [];
                $scope.items = [];
                for(var key in result){
                    $scope.systems.push(key);
                    $scope.items.push({key:key,value:result[key]});
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    getItems();


    $scope.addTag = function(tag){
        var data = {};
        data[tag.text] = {isInit:false};
        $http.post(configUri+'/systeminit', {value:data}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                if(!$scope.items) $scope.items = [];
                $scope.items.push({key:tag.text,value:{isInit:false}});
                $scope.success('添加成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.removeTag = function(tag){
        $http.delete(configUri+'/systeminit', {
            params:{
                token: sso.getToken(),
                key: tag.text
            }
        }).success(function(result) {
            if(result.err){
                return $scope.error(result.msg);
            }
            var item = _.find($scope.items,{'key':tag.text});
            var index = $scope.items.indexOf(item);
            $scope.items.splice(index, 1);
            $scope.success('删除成功');
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.update = function(item){
        var data = {};
        data[item.key] = item.value;
        $http.post(configUri+'/systeminit', {value:data}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.success('设置成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.init = function(){
        // console.log($scope.items);return;
        var initItems = [];
        for(var i=0;i<$scope.items.length;i++){
            if($scope.items[i].value.isInit){
                initItems.push($scope.items[i].key);
            }
        }
        var location = [
            global.translateByKey('app.config.manage'),
            global.translateByKey('app.config.systeminit')+'('+initItems+')'
        ]
        $http.post(configUri+'/system/init', {}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            console.log(result);
            if(result.err){
                global.sendLog(26, {}, {details:false}, {}, 0, "app.config.systeminit", location, 0,function (err, result) {
                    console.log("err %j, result %j", err, result);
                });
                $scope.error(result.msg);
            }else{
                global.sendLog(26, {}, {details:false}, {}, 1, "app.config.systeminit", location, 0,function (err, result) {
                    console.log("err %j, result %j", err, result);
                });
                $scope.success('初始化成功');
                getItems();
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

}]);

app.controller('ConfigSystemConfigCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var sso = jm.sdk.sso;
    var config = jm.sdk.config;

    var hkey = 'SystemConfig';

    $scope.items = ['common'];

    var originValue = {};
    $scope.getItems = function(){
        config.listConfig({token: sso.getToken(),root:hkey},function(err,result){
            if(err){
                err = result&&result.msg || err.message;
                return $scope.error(err);
            }
            console.log(result);
            var rows = result.rows || [];
            $scope.items = _.union($scope.items, rows);
        });
    };
    $scope.getItems();

    $scope.addItem = function(item){
        if(!$scope.name){
            return $scope.warning('请输入系统名');
        }
        if($scope.items.indexOf(item)!=-1){
            return $scope.warning('新增的系统名已存在');
        }


        var location = [
            global.translateByKey('app.config.manage'),
            global.translateByKey('app.config.systemconfig'),
            global.translateByKey('config.systemconfig.add')+'('+item+')'
        ];

        config.setConfig({token: sso.getToken(),root:hkey,key:item},function(err,result){
            if(err){
                global.sendLog(26, {}, {details:false}, {}, 0, "config.systemconfig.add", location, 0,function (err, result) {
                    console.log("err %j, result %j", err, result);
                });
                err = result&&result.msg || err.message;
                return $scope.error(err);
            }
            global.sendLog(26, {}, {details:false}, {}, 1, "config.systemconfig.add", location, 0,function (err, result) {
                console.log("err %j, result %j", err, result);
            });
            $scope.name = '';
            $scope.items.push(item);
            $timeout(function(){
                $scope.success('新增成功');
            });
        });
    };

    $scope.selectItem = function(item,index){
        $scope.selected = index;
        $scope.item = item;
        config.getConfig({token: sso.getToken(),root:hkey,key:item},function(err,result){
            if(err){
                err = result&&result.msg || err.message;
                return $scope.error(err);
            }
            originValue = result.ret;

            $timeout(function() {
                $scope.val = result.ret || {};
                $scope.val = JSON.stringify($scope.val, null, "\t");
                $scope.defaultVal = angular.copy($scope.val);
            });
        });
    };

    $scope.deleteItem = function(item){
        $scope.openTips({
            title:'提示',
            content:'是否确定删除?',
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                var location = [
                    global.translateByKey('app.config.manage'),
                    global.translateByKey('app.config.systemconfig'),
                    global.translateByKey('config.systemconfig.delete')+'('+item+')'
                ]
                config.delConfig({token: sso.getToken(),root:hkey,key:item},function(err,result){
                    if(err){
                        global.sendLog(26, {}, {details:false}, {}, 1, "app.config.systemconfig", location, 0,function (err, result) {
                            console.log("err %j, result %j", err, result);
                        });
                        err = result&&result.msg || err.message;
                        return $scope.error(err);
                    }

                    global.sendLog(26, {}, {details:false}, {}, 1, "app.config.systemconfig", location, 0,function (err, result) {
                        console.log("err %j, result %j", err, result);
                    });
                    $scope.items.splice($scope.items.indexOf(item), 1);
                    $timeout(function(){
                        $scope.selected = null;
                        $scope.item = null;
                        $scope.val = JSON.stringify({}, null, "\t");
                        $scope.success('删除成功');
                    });
                });
            }
        });
    };

    $scope.save = function(){
        // console.log(originValue);return;
        if(!$scope.item){
            return $scope.warning('请选择需要配置的系统');
        }
        var value;
        try{
            value = JSON.parse($scope.val);
        }catch (e){
            return $scope.warning('请输入正确的JSON格式数据');
        }

        var location = [
            global.translateByKey('app.config.manage'),
            global.translateByKey('app.config.systemconfig'),
            global.translateByKey('config.edit')+'('+$scope.item+')'
        ]
        config.setConfig({token: sso.getToken(),root:hkey,key:$scope.item,value:value},function(err,result){
            if(err){
                global.sendLog(26, {val:originValue}, {val:value}, {val:"app.config.systemconfig"}, 0, "app.config.systemconfig", location, 1,function (err, result) {
                    console.log("err %j, result %j", err, result);
                });
                err = result&&result.msg || err.message;
                return $scope.error(err);
            }
            global.sendLog(26, {val:originValue}, {val:value}, {val:"app.config.systemconfig"}, 1, "app.config.systemconfig", location, 1,function (err, result) {
                console.log("err %j, result %j", err, result);
            });
            $timeout(function(){
                $scope.val = JSON.stringify(value, null, "\t");
                console.log($scope.val);
                $scope.success('配置成功');
            });
        });
    };

    $scope.refresh = function(){
        if(!$scope.item){
            return $scope.warning('请选择需要刷新的系统');
        }
        $http.post(configUri+'/systemconfig', {name:$scope.item}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.success('刷新成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    $scope.myStyle={'height':$scope.app.navHeight-123+'px'};

}]);



app.controller('ConfigUnifiedCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {

    var config = jm.sdk.config;
    var sso = jm.sdk.sso;
    // var ajax = jm.ajax;

    var hkey = 'root:config:roots';
    $scope.configVal = $scope.configVal || {};
    $scope.allVal = $scope.allVal || {};

    $scope.kitems = ['root:config:roots'];

    $scope.getItems = function () {
            config.listConfig({token: sso.getToken(), root: hkey, all: 1}, function (err, result) {
                if (err) {
                    err = result && result.msg || err.message;
                    return $scope.error(err);
                }
                var v = [];
                for (var key in result) {
                    var value = result[key];

                    v.push(value.title || key);
                }

                $scope.config_keys = Object.keys(result);
                var rows = $scope.config_keys || [];

                for(var i=0;i<rows.length;i++){
                    if(rows[i]=='root:config:roots'){
                        rows.splice(i,1);
                        for(var j=0;j<v.length;j++){
                            if(v[j]=='统一配置'){
                                v.splice(j,1);
                            }
                        }
                    }
                }
                rows.unshift('root:config:roots');
                v.unshift('统一配置');
                $scope.kitems = v;

            });
    };
    $scope.getItems();


    $scope.edit = function (){
        if($scope.ubtnname=='编辑'){
            $state.go('app.config.unified.view');
            $scope.ubtnname='返回';
        }
        else {
            $state.go('app.config.unified');
            $scope.ubtnname='编辑';
        }
    }


    $scope.isCollapsed = true;
    $scope.change = function(id){

        $scope.isCollapsed = !$scope.isCollapsed;
        if($scope.isCollapsed){
            $scope.ebtnname='新增';
        }else{
            if(id==0){
                $scope.ebtnname='取消';
            }
        }
    };

    $scope.addkItem = function(kitem,title){
        $scope.isCollapsed = true;
        $scope.ebtnname='新增';
        if(!kitem){
            return $scope.warning('请输入配置项');
        }
        if($scope.kitems.indexOf(kitem)!=-1){
            return $scope.warning('新增的配置项已存在');
        }
        if(!title){
            return $scope.warning('请输入名称');
        }
        if($scope.kitems.indexOf(title)!=-1){
            return $scope.warning('新增的名称已存在');
        }

        var location = [
            global.translateByKey('app.config.manage'),
            global.translateByKey('app.config.unified'),
            global.translateByKey('config.systemunified.addk')+'('+title+')'
        ];

        config.setConfig({token: sso.getToken(),root:hkey,key:kitem,value:{title:title}},function(err,result){
            if(err){
                err = result&&result.msg || err.message;
                return $scope.error(err);
            }

            // config.setConfig({token: sso.getToken(),root:kitem,key:{}},function(err,result){
            //     if(err){
            //         global.sendLog(26, {}, {details:false}, {}, 0, "app.config.unified", location, 0,function (err, result) {
            //             console.log("err %j, result %j", err, result);
            //         });
            //         err = result&&result.msg || err.message;
            //         return $scope.error(err);
            //     }
            //     global.sendLog(26, {}, {details:false}, {}, 1, "app.config.unified", location, 0,function (err, result) {
            //         console.log("err %j, result %j", err, result);
            //     });
                config.listConfig({token: sso.getToken(), root: hkey, all: 1}, function (err, result) {
                    if (err) {
                        err = result && result.msg || err.message;
                        return $scope.error(err);
                    }
                    var v = [];
                    for (var key in result) {
                        var value = result[key];

                        v.push(value.title || key);
                    }
                    $scope.config_keys = Object.keys(result);
                    var rows = $scope.config_keys || [];

                    for(var i=0;i<rows.length;i++){
                        if(rows[i]=='root:config:roots'){
                            rows.splice(i,1);
                            for(var j=0;j<v.length;j++){
                                if(v[j]=='统一配置'){
                                    v.splice(j,1);
                                }
                            }
                        }
                    }
                    rows.unshift('root:config:roots');
                    v.unshift('统一配置');
                    $scope.kitems = v;
                    $timeout(function(){
                        $scope.success('新增成功');
                    });

                });
            });
        // });

    };


    $scope.addItem = function(item){
        console.log($scope.kitem);
        if(!item){
            return $scope.warning('请输入配置键');
        }
        if($scope.items.indexOf(item)!=-1){
            return $scope.warning('新增的配置键已存在');
        }

        var location = [
            global.translateByKey('app.config.manage'),
            global.translateByKey('app.config.unified'),
            global.translateByKey('config.systemunified.item')+'('+$scope.kitem+')',
            global.translateByKey('config.systemunified.addi')+'('+item+')'
        ];
        config.setConfig({token: sso.getToken(),root:$scope.secondselected,key:item,value:{}},function(err,result){
            if(err){
                global.sendLog(26, {}, {details:false}, {}, 0, "app.config.unified", location, 0,function (err, result) {
                    console.log("err %j, result %j", err, result);
                });
                err = result&&result.msg || err.message;
                return $scope.error(err);
            }
            global.sendLog(26, {}, {details:false}, {}, 1, "app.config.unified", location, 0,function (err, result) {
                console.log("err %j, result %j", err, result);
            });
            $scope.name = '';
            $scope.items.push(item);
            $timeout(function(){
                $scope.success('新增成功');
            });
        });
    };

    var alldataori = {};
    $scope.selectkItem = function(kitem,index){
        $scope.kselected = index;
        $scope.selected = -1;
        $scope.kitem = kitem;

         $scope.secondselected = $scope.config_keys[index];

            config.listConfig({token: sso.getToken(), root: $scope.secondselected,all:1}, function (err, result) {
                if (err) {
                    err = result && result.msg || err.message;
                    return $scope.error(err);
                }
                console.log(result);
                alldataori = result;
                var v = [];
                for (var key in result) {
                    var value = result[key];
                    v.push(key);
                }

                $timeout(function() {
                    $scope.allVal.val = JSON.stringify(result, null, "\t");
                    $scope.defaultVal = angular.copy($scope.allVal.val);
                    $scope.items = v;
                    console.log(v);
                });

            });
    };

    var originData = {};
    $scope.selectItem = function(item,index){
        $scope.selected = index;
        $scope.item = item;
        config.getConfig({token: sso.getToken(),root:$scope.secondselected,key:item},function(err,result){
            if(err){
                err = result&&result.msg || err.message;
                return $scope.error(err);
            }
            originData = result.ret;
            $timeout(function() {
                $scope.configVal.val = result.ret || {};
                $scope.configVal.val = JSON.stringify($scope.configVal.val, null, "\t");
                $scope.defaultVal = angular.copy($scope.configVal.val);
                console.log(result);
            });
        });
    };

    $scope.deleteAll = function(){
        $scope.openTips({
            title:'提示',
            content:'是否确定清空?',
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                var location = [
                    global.translateByKey('app.config.manage'),
                    global.translateByKey('app.config.unified'),
                    global.translateByKey('config.systemunified.item')+'('+$scope.kitem+')',
                    global.translateByKey('config.systemunified.deleteallkey')
                ]
                config.delRoot({token: sso.getToken(),root:$scope.secondselected},function(err,result){
                    if(err){
                        err = result&&result.msg || err.message;
                        return $scope.error(err);
                    }
                    $scope.items.splice(0, $scope.items.length);//清空数组所有元素
                    config.setConfig({token: sso.getToken(),root:$scope.secondselected,key:{}},function(err,result){
                        if(err){
                            global.sendLog(26, {}, {details:false}, {}, 0, "app.config.systemunified", location, 0,function (err, result) {
                                console.log("err %j, result %j", err, result);
                            });
                            err = result&&result.msg || err.message;
                            return $scope.error(err);
                        }
                        global.sendLog(26, {}, {details:false}, {}, 0, "app.config.systemunified", location, 0,function (err, result) {
                            console.log("err %j, result %j", err, result);
                        });
                        $timeout(function(){
                            $scope.selected = null;
                            $scope.item = null;
                            $scope.success('清空成功');
                        });
                    });
                });
            }
        });
    };

    $scope.deletekItem = function(kitem,index){

        $scope.openTips({
            title:'提示',
            content:'是否确定删除?',
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                var location = [
                    global.translateByKey('app.config.manage'),
                    global.translateByKey('app.config.unified'),
                    global.translateByKey('config.systemunified.deletek')+'('+kitem+')'
                ]
                $scope.secondselected = $scope.config_keys[index];
                config.delConfig({token: sso.getToken(),root:hkey,key:$scope.secondselected},function(err,result){
                    if(err){
                        global.sendLog(26, {}, {details:false}, {}, 0, "app.config.unified", location, 0,function (err, result) {
                            console.log("err %j, result %j", err, result);
                        });
                        err = result&&result.msg || err.message;
                        return $scope.error(err);
                    }

                    global.sendLog(26, {}, {details:false}, {}, 1, "app.config.unified", location, 0,function (err, result) {
                        console.log("err %j, result %j", err, result);
                    });
                    $scope.kitems.splice(index, 1);
                    $scope.config_keys.splice(index, 1);
                    $timeout(function(){
                        $scope.selected = null;
                        $scope.success('删除成功');
                    });
                });

            }
        });
    };

    $scope.deleteItem = function(item){
        $scope.openTips({
            title:'提示',
            content:'是否确定删除?',
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                config.delConfig({token: sso.getToken(),root:$scope.secondselected,key:item},function(err,result){
                    if(err){
                        err = result&&result.msg || err.message;
                        return $scope.error(err);
                    }
                    $scope.items.splice($scope.items.indexOf(item), 1);
                    $timeout(function(){
                        $scope.selected = null;
                        $scope.item = null;
                        $scope.val = JSON.stringify({}, null, "\t");
                        $scope.success('删除成功');
                    });
                });
            }
        });
    };

    $scope.saveall = function(){
        if(!$scope.kitem){
            return $scope.warning('请选择需要配置的系统');
        }
        var value;
        try{
            value = JSON.parse($scope.allVal.val);
        }catch (e){
            return $scope.warning('请输入正确的JSON格式数据');
        }
        console.log(value);
        var s = [];
        for (var key in value) {
            var val = value[key];
            s.push(key);
        }
        console.log(s);
        console.log($scope.items);
        var location = [
            global.translateByKey('app.config.manage'),
            global.translateByKey('app.config.unified'),
            global.translateByKey('config.systemunified.item')+'('+$scope.kitem+')',
            global.translateByKey('config.view.saveall')
        ];
        if (s.sort().toString() == $scope.items.sort().toString()){
            config.setConfigs({token: sso.getToken(),root:$scope.secondselected,value:value},function(err,result){
                if(err){
                    global.sendLog(26, {val:alldataori}, {val:value}, {val:'config.view.saveall'}, 0, "app.config.unified", location, 1,function (err, result) {
                        console.log("err %j, result %j", err, result);
                    });
                    err = result&&result.msg || err.message;
                    return $scope.error(err);
                }
                global.sendLog(26, {val:alldataori}, {val:value}, {val:'config.view.saveall'}, 1, "app.config.unified", location, 1,function (err, result) {
                    console.log("err %j, result %j", err, result);
                });
                alldataori = value;
                $timeout(function(){
                    $scope.allVal.val = JSON.stringify(value, null, "\t");
                    $scope.success('配置成功');
                });
            });
        }else {
            config.delRoot({token: sso.getToken(),root:$scope.secondselected},function(err,result){
                if(err){
                    err = result&&result.msg || err.message;
                    return $scope.error(err);
                }
                config.setConfigs({token: sso.getToken(),root:$scope.secondselected,value:value},function(err,result){
                    if(err){
                        global.sendLog(26, {val:alldataori}, {val:value}, {val:'config.view.saveall'}, 0, "app.config.unified", location, 1,function (err, result) {
                            console.log("err %j, result %j", err, result);
                        });
                        err = result&&result.msg || err.message;
                        return $scope.error(err);
                    }
                    global.sendLog(26, {val:alldataori}, {val:value}, {val:'config.view.saveall'}, 1, "app.config.unified", location, 1,function (err, result) {
                        console.log("err %j, result %j", err, result);
                    });
                    alldataori = value;
                    $timeout(function(){
                        $scope.allVal.val = JSON.stringify(value, null, "\t");
                        $scope.success('配置成功');
                    });
                });
            });
        }
        // config.setConfigs({token: sso.getToken(),root:$scope.secondselected,value:value},function(err,result){
        //     if(err){
        //         err = result&&result.msg || err.message;
        //         return $scope.error(err);
        //     }
        //     $timeout(function(){
        //         $scope.allVal.val = JSON.stringify(value, null, "\t");
        //         $scope.success('配置成功');
        //     });
        // });
    };


    $scope.save = function(){
        if(!$scope.item){
            return $scope.warning('请选择需要配置的系统');
        }
        var value;
        try{
            value = JSON.parse($scope.configVal.val);
        }catch (e){
            return $scope.warning('请输入正确的JSON格式数据');
        }
        // console.log($scope.configVal.val);
        // console.log(value);
        // var s = [];
        // for (var key in value) {
        //     var val = value[key];
        //     s.push(key);
        // }
        // console.log(s);
        var location = [
            global.translateByKey('app.config.manage'),
            global.translateByKey('app.config.unified'),
            global.translateByKey('config.systemunified.item')+'('+$scope.kitem+')',
            global.translateByKey('config.systemunified.key')+'('+$scope.item+')',
            global.translateByKey('config.systemunified.save')
        ];
        config.setConfig({token: sso.getToken(),root:$scope.secondselected,key:$scope.item,value:value},function(err,result){
            if(err){
                global.sendLog(26, {val:originData}, {val:value}, {val:'config.systemunified.save'}, 0, "app.config.unified", location, 1,function (err, result) {
                    console.log("err %j, result %j", err, result);
                });
                err = result&&result.msg || err.message;
                return $scope.error(err);
            }
            // console.log(result);
            global.sendLog(26, {val:originData}, {val:value}, {val:'config.systemunified.save'}, 1, "app.config.unified", location, 1,function (err, result) {
                console.log("err %j, result %j", err, result);
            });
            $timeout(function(){
                $scope.configVal.val = JSON.stringify(value, null, "\t");
                $scope.success('配置成功');

            });
        });
    };

    $scope.refresh = function(){
        if(!$scope.item){
            return $scope.warning('请选择需要刷新的系统');
        }
        $http.post(configUri+'/systemconfig', {name:$scope.item}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                console.log(result);
                $scope.error(result.msg);
            }else{
                $scope.success('刷新成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

}]);